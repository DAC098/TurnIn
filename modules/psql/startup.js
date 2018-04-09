const process = require('process');
const n_path = require('path');

const _ = require('lodash');

const db = require('./index');
const log = require('../log');
const security = require('../security');
const setup = require('../setup');
const variables = require('../variables');

const createUser = require('./helpers/createUser');

const File = require('../fs/File');
const Dir = require('../fs/Dir');

const wait = time => {
	return new Promise((resolve) => {
		let timer = setTimeout(() => {
			clearTimeout(timer);
			resolve();
		},time);
	});
};

const awaitConnection = async (attempts = 3,interval = 1000 * 10) => {
	let connected = false;
	for(let i = 0; i < attempts; ++i) {

		try {
			let pool = db.getPool();
			let con = await pool.connect();
			connected = true;

			con.release();

			return true;
		} catch(err) {
			if(err.code !== 'ECONNREFUSED')
				throw err;
		}

		if(!connected)
			await wait(interval);
	}

	return false;
};

exports.awaitConnection = awaitConnection;

const loadTestData = async () => {
	let con = null;

	try {
		let pool = db.getPool();
		con = await pool.connect();

		let test_data = JSON.parse(await File.read(process.cwd() + '/psql/test_data.json'));

		for(let test_user of test_data.users) {
			try {
				let result = await createUser({'type':'master'},test_user,con);
			} catch(err) {
				log.error(err.stack);
			}
		}

		for(let test_section of test_data.sections) {
			try {
				let keys = Object.keys(test_section);
				let values = [];

				for(let k of keys) {
					values.push(test_section[k]);
				}

				let insert = `
					insert into sections (${keys.join(',')}) values
					(${values.join(',')})
					on conflict on constraint unique_sections do nothing
					`;

				let result = await con.query(insert);
			} catch(err) {
				log.error(err.stack);
			}
		}

		let result = await con.query('select * from images');

		if(result.rows.length < 6) {
			for(let test_image of test_data.images) {
				try {
					let keys = Object.keys(test_image);
					let values = [];

					for(let k of keys) {
						if(typeof test_image[k] === 'object') {
							let str = JSON.stringify(_.merge({},variables.default_image_options,test_image[k]));
							values.push(`'${str}'`);
						} else {
							values.push(test_image[k]);
						}
					}

					let insert = `
					insert into images (${keys.join(',')}) values
					(${values.join(',')})`;

					let result = await con.query(insert);
				} catch(err) {
					log.error(err.stack);
				}
			}
		}

		for(let test_assignment of test_data.assignments) {
			try {
				let keys = Object.keys(test_assignment);
				let values = [];

				for(let k of keys) {
					if(typeof test_assignment[k] === 'object') {
						values.push(`'${JSON.stringify(_.merge({},variables.default_assignment_options,test_assignment[k]))}'`);
					} else {
						values.push(test_assignment[k]);
					}
				}

				let insert = `
				insert into assignments (${keys.join(',')}) values
				(${values.join(',')})
				on conflict on constraint unique_title_section do nothing
				returning *`;

				let result = await con.query(insert);

				if(result.rows.length === 1) {
					let dir_path = n_path.join(
						setup.getKey('directories.data_root'),
						'assignments',
						`${result.rows[0].id}`
					);

					await Dir.make(dir_path);
				}
			} catch(err) {
				log.error(err.stack);
			}
		}

		for(let test_assignment_image of test_data.assignment_images) {
			try {
				let keys = Object.keys(test_assignment_image);
				let values = [];

				for(let k of keys) {
					values.push(test_assignment_image[k]);
				}

				let insert = `
				insert into assignment_images (${keys.join(',')}) values
				(${values.join(',')})
				on conflict on constraint image_assignment_pk do nothing`;

				let result = await con.query(insert);
			} catch(err) {
				log.error(err.stack);
			}
		}
	} catch(err) {
		log.error(err.stack);
	}

	if(con)
		con.release();
};

exports.loadTestData = loadTestData;

const startup = async () => {
	let con = null;

	try {
		let pool = db.getPool();
		con = await pool.connect();
		let master_check_query = `select * from users where username = 'master'`;

		let res = await con.query(master_check_query);

		if(res.rows.length === 0) {
			log.info('creating master user');
			let salt = security.genSalt();
			let password = security.genHash('password',salt);
			let insert_master = `insert into users (username,password,salt,type) values
			('master','${password}','${salt}','master')
			returning *`;

			let res = await con.query(insert_master);

			if(res.rows.length === 1) {
				log.info('created master user');
			} else {
				log.warn('unable to create master user');
			}
		}
	} catch(err) {
		log.error(err.stack);
	}

	if(con)
		con.release();
};

exports.startup = startup;