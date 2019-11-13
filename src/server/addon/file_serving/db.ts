import typeorm from "typeorm"

import setup from "../../setup";

import { File } from "./entities/File";
import logger from "./logger";

typeorm.createConnection({
	type: "postgres",
	name: "file_serving",
	host: setup.getKey("psql.hostname"),
	port: setup.getKey("psql.port"),
	username: setup.getKey("psql.username"),
	password: setup.getKey("psql.password"),
	database: setup.getKey("psql.database"),
	entities: [
		File
	],
	synchronize: true
}).catch(err => {
	logger.error("error when loading database connection.",err.message);
});