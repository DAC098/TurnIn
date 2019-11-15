import "reflect-metadata";
import typeorm from "typeorm";

import setup from "./setup";
import {
	User,
	Section,
	DockerImage,
	DockerContainer,
	Assignment,
	AssignmentFile,
	Submission,
	SubmissionFile
} from "app/entities";
import logger from "./logger";
import { genSalt, genHash } from "app/lib/security";

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

async function connect() {
	try {
		await typeorm.createConnection({
			type: "postgres",
			host: default_hostname,
			port: default_port,
			username: default_username,
			password: default_password,
			database: default_database,
			entities: [
				User,
				Section,
				DockerImage,
				DockerContainer,
				Assignment,
				AssignmentFile,
				Submission,
				SubmissionFile
			],
			subscribers: [],
			synchronize: true,
			dropSchema: true,
			logging: false,
			namingStrategy: new NamingStrat()
		});
	}
	catch (err) {
		logger.error(err.stack);
		return;
	}

	try {
		let user_repo = typeorm.getRepository(User);
		let any_users = await user_repo.find();

		if (any_users.length === 0) {
			logger.info("creating admin user");

			let salt = genSalt();
			let password = genHash("password",salt);
			
			let admin_user = new User();
			admin_user.username = "admin";
			admin_user.password = password;
			admin_user.salt = salt;

			await user_repo.save(admin_user);
		}
		else {
			// nothing for the time being
		}
	}
	catch(err) {
		logger.error("error when setting up database.",err.stack);
	}
}

export default connect;