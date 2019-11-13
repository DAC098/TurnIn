import * as nPath from 'path';
import {default as nFS} from "fs";

import Setup from '../lib/Setup';
import { exists, makeDir, loadYamlSync, existsSync } from 'app/lib/fs/common';

const traverseKeys = (obj: object): Map<string,any> => {
	let rtn = new Map<string,any>();

	for(let k in obj) {
		if(typeof obj[k] === 'object') {
			let t = traverseKeys(obj[k]);

			for(let [tk,tv] of t) {
				rtn.set(`${k}.${tk}`,tv);
			}
		} else {
			rtn.set(k,obj[k]);
		}
	}

	return rtn;
};

const cliValidNames = (obj: object): Set<string> => {
	let keys = new Set<string>();
	let found = traverseKeys(obj);

	for(let [k,v] of found) {
		keys.add(`--c-${k}`);
	}

	return keys;
};

interface SetupObject {
	server?: {
		hostname: string,
		port: number,
		secure: boolean,
		backlog: number
	},
	tls?: {
		key: string,
		cert: string
	},
	psql?: {
		hostname: string,
		port: number,
		username: string,
		password: string,
		database: string
	},
	security?: {
		secret: string
	},
	docker?: {
		url: string,
		host_mount: string
	},
	directories?: {
		data_root: string
	}
}

let default_docker_path = "/var/run/docker.sock";

if (process.platform === "win32") {
	default_docker_path = "http://localhost:2375";
}

const default_setup: SetupObject = {
	server: {
		hostname: 'localhost',
		port: 443,
		backlog: 500,
		secure: true
	},
	tls: {
		key: "",
		cert: ""
	},
	psql: {
		hostname: '127.0.0.1',
		port: 5432,
		username: 'postgres',
		password: 'password',
		database: "postgres"
	},
	security: {
		secret: 'secret'
	},
	docker: {
		url: default_docker_path,
		host_mount: '/var/lib/turnin/data'
	},
	directories: {
		data_root: '/var/lib/turnin/data'
	}
};

const valid_cli_names = cliValidNames(default_setup);
const setup = new Setup<SetupObject>(default_setup);

let set_keys = new Set<string>();

if(existsSync('/etc/turnin/config.yaml',"file")) {
	let data = loadYamlSync('/etc/turnin/config.yaml');

	let keys = traverseKeys(data);

	for(let [k,v] of keys) {
		setup.setKey(k,v);
	}
}

for(let i = 1,l = process.argv.length; i < l; ++i) {
	let arg = process.argv[i];

	if (arg.startsWith("--") || arg.startsWith("-")) {
		if(valid_cli_names.has(arg) && !set_keys.has(arg)) {
			let key_path = arg.replace('--c-','');

			if(process.argv[++i] != null) {
				setup.setKey(key_path,process.argv[i + 1]);
				set_keys.add(arg);
				++i;
			}
		} else if(arg === '-c' || arg === '--config') {
			if(process.argv[++i] != null) {
				let file_path = process.argv[i];
				let file_data = {};
				++i;

				if(!existsSync(file_path,"file")) {
					throw new Error(`config file not found. ${file_path}`);
				}

				switch(nPath.extname(file_path)) {
					case ".yaml":
					case ".yml":
						file_data = loadYamlSync(file_path);
						break;
					case ".json":
						file_data = JSON.parse(nFS.readFileSync(file_path,{encoding:"utf8"}));
						break;
				}

				let keys = traverseKeys(file_data);

				for (let [k,v] of keys) {
					setup.setKey(k,v);
				}
			}
		}
		else {
			throw new Error(`unknown config option. given "${arg}"`);
		}
	}
}

const checkDirectories = async (given_setup: Setup<any>) => {
	let data_dir = given_setup.getKey('directories.data_root');	
	let checking = ['assignments','images','submissions'];

	if (data_dir == null) {
		throw new TypeError("setup directories.data_root is null");
	}
	
	for(let dir of checking) {
		if(!await exists(nPath.join(data_dir,dir),"dir")) {
			await makeDir(nPath.join(data_dir,dir));
		}
	}
};

export default setup;
