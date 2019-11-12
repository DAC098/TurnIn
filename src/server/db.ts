import SQLPool from "../lib/psql/SQLPool";

import setup from "./setup";

const db = new SQLPool();

const default_hostname = setup.getKey("psql.hostname");
const default_port = setup.getKey("psql.port");
const default_username = setup.getKey("psql.username");
const default_password = setup.getKey("psql.password");

db.createPool({
	host: default_hostname,
	port: default_port,
	user: default_username,
	password: default_password
});

export default db;