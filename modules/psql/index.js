const setup = require('../setup');

const SQLPool = require('./lib/SQLPool');

const db = new SQLPool({},{
	host: setup.getKey('psql.hostname'),
	port: setup.getKey('psql.port'),
	connectionLimit: 20,
	user: 'postgres',
	password: 'password'
},{
	default_conn: {
		database: 'turnin'
	}
});

module.exports = db;