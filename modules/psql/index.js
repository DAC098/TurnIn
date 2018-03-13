const setup = require('../setup');

const SQLPool = require('./lib/SQLPool');

const common_connection = {
	host: setup.getKey('psql.hostname'),
	port: setup.getKey('psql.port'),
	connectionLimit: 20,
	user: setup.getKey('psql.username'),
	password: setup.getKey('psql.password')
};

const db = new SQLPool({},common_connection,{
	default_conn: {
		database: 'turnin'
	}
});

module.exports = db;