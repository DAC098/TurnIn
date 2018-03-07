const process = require('process');
const path = require('path');

const Setup = require('./Setup');

const traverseKeys = obj => {
	let rtn = new Set();

	for(let k in obj) {
		if(typeof obj[k] === 'object') {
			let t = traverseKeys(obj[k]);

			for(let tk of t) {
				rtn.add(`${k}.${tk}`);
			}
		} else {
			rtn.add(k);
		}
	}

	return rtn;
};

const cliValidNames = obj => {
	let keys = new Set();
	let found = traverseKeys(obj);

	for(let k of found) {
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
		username: 'postgres',
		password: 'password'
	}
};
const valid_cli_names = cliValidNames(default_setup);
const setup = new Setup(default_setup);

const processCliArgs = () => {
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
		}
	}
};

setup['processCliArgs'] = processCliArgs;

module.exports = setup;
