const process = require('process');
const path = require('path');

const Setup = require('./Setup');
const File = require('../fs/File');
const Dir = require('../fs/Dir');

const traverseKeys = obj => {
	let rtn = new Map();

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

const cliValidNames = obj => {
	let keys = new Set();
	let found = traverseKeys(obj);

	for(let [k,v] of found) {
		keys.add(`--c-${k}`);
	}

	return keys;
};

const cwd = process.cwd();

const default_setup = {
	server: {
		hostname: 'localhost',
		port: 443
	},
	socket: {
		hostname: 'localhost',
		port: 8443
	},
	tls: {
		key: path.join(cwd,'./tls/local/svr.key'),
		cert: path.join(cwd,'./tls/local/svr.crt')
	},
	redis: {
		hostname: '127.0.0.1',
		port: 6379
	},
	psql: {
		hostname: '127.0.0.1',
		port: 5432,
		username: 'turnin',
		password: 'turnin_password'
	},
	security: {
		secret: 'secret'
	},
	docker: {
		host_mount: '/var/lib/turnin/data'
	},
	directories: {
		data_root: '/var/lib/turnin/data'
	}
};
const valid_cli_names = cliValidNames(default_setup);
const setup = new Setup(default_setup);

const loadEtc = async () => {
	if(await File.exists('/etc/turnin/config.yaml')) {
		let data = await File.loadYaml('/etc/turnin/config.yaml');

		let keys = traverseKeys(data);

		for(let [k,v] of keys) {
			setup.setKey(k,v);
		}
	}
};

setup['loadEtc'] = loadEtc;

const processCliArgs = async () => {
	let set_keys = new Set();

	for(let i = 0,l = process.argv.length; i < l; ++i) {
		let arg = process.argv[i];

		if(valid_cli_names.has(arg) && !set_keys.has(arg)) {
			let key_path = arg.replace('--c-','');

			if(typeof process.argv[i + 1] !== 'undefined') {
				setup.setKey(key_path,process.argv[i + 1]);
				set_keys.add(arg);
				++i;
			}
		} else if(arg === '-c' || arg === '--config') {
			if(typeof process.argv[i + 1] !== 'undefined') {
				let file_path = process.argv[i + 1];
				let file_data = {};
				++i;

				if(!await File.exists(file_path))
					continue;

				switch(path.extname(file_path)) {
					case ".yaml":
					case ".yml":
						file_data = await File.loadYaml(file_path);
						break;
					case ".json":
						file_data = JSON.parse(await File.read(file_path));
						break;
				}

				let keys = traverseKeys(file_data);

				for(let [k,v] of keys) {
					setup.setKey(k,v);
				}
			}
		}
	}
};

setup['processCliArgs'] = processCliArgs;

const checkDirectories = async () => {
	let data_dir = setup.getKey('directories.data_root');
	let checking = ['assignments','images','submissions'];

	for(let dir of checking) {
		if(!await Dir.exists(path.join(data_dir,dir))) {
			await Dir.make(path.join(data_dir,dir));
		}
	}
};

setup['checkDirectories'] = checkDirectories;

module.exports = setup;

setup['helpers'] = require('./helpers');
