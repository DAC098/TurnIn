import "reflect-metadata";
import typeorm from "typeorm";

import setup from "./setup";
import {
	User,
	Section,
	Enrollment
} from "app/entities";
import logger from "./logger";

const default_hostname = setup.getKey("psql.hostname");
const default_port = setup.getKey("psql.port");
const default_username = setup.getKey("psql.username");
const default_password = setup.getKey("psql.password");
const default_database = setup.getKey("psql.database");

function snakeCase(str: string) {
	return str.replace(/(?:([a-z])([A-Z]))|(?:((?!^)[A-Z])([a-z]))/g, "$1_$3$2$4").toLowerCase();
}

class NamingStrat extends typeorm.DefaultNamingStrategy implements typeorm.NamingStrategyInterface {

	tableName(target_name: string, user_specified_name: string): string {
		return user_specified_name ? user_specified_name : snakeCase(target_name);
	}

	columnName(property_name: string, custom_name: string, embedded_prefix: string[]): string {
		return snakeCase(embedded_prefix.concat(custom_name ? custom_name : property_name).join("_"));
	}

	columnNameCustomized(custom_name: string): string {
		return custom_name;
	}
	
	relationName(property_name: string): string {
		return snakeCase(property_name);
	}
}

typeorm.createConnection({
	type: "postgres",
	host: default_hostname,
	port: default_port,
	username: default_username,
	password: default_password,
	database: default_database,
	entities: [
		User,
		Section,
		Enrollment
	],
	subscribers: [],
	synchronize: true,
	dropSchema: true,
	logging: false,
	namingStrategy: new NamingStrat()
}).catch(err => {
	logger.error(err.stack);
});