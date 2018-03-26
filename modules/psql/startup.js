const process = require('process');

const db = require('./index');
const log = require('../log');
const security = require('../security');

const createUser = require('./helpers/createUser');

const File = require('../fs/File');

const is_dev = process.env.NODE_ENV;

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