const db = require('./index');
const log = require('../log');
const security = require('../security');

const startup = async () => {
	try {
		let pool = db.getPool();
		let con = await pool.connect();
		let master_check_query = `select * from users where username = 'master'`;

		let res = await con.query(master_check_query);

		if(res.rows.length === 0) {
			log.info('creating master user');
			let salt = security.genSalt();
			let password = security.genHash('password',salt);
			let insert_master = `insert into users (username,password,salt,type) values
			('master','${password}','${salt}','master')`;

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
};

exports.startup = startup;