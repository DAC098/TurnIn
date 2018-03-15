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

		if(is_dev) {
			let test_data = JSON.parse(await File.read(process.cwd() + '/psql/test_data.json'));

			for(let test_user of test_data.users) {
				try {
					let result = await createUser({'type':'master'},test_user);
				} catch(err) {

				}
			}
		}
	} catch(err) {
		log.error(err.stack);
	}

	if(con)
		con.release();
};

exports.startup = startup;