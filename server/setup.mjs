import process from 'process';
import path from 'path';

import Setup from '../modules/Setup/main.mjs';

const root = process.cwd();

const setup = new Setup({
	server: {
		hostname: 'localhost',
		port: 443
	},
	socket: {
		hostname: 'localhost',
		port: 8443
	},
	tls: {
		key: path.join(root,'./tls/local/svr.key'),
		cert: path.join(root,'./tls/local/svr.crt')
	},
	redis: {
		hostname: '127.0.0.1',
		port: 6379
	},
	psql: {
		hostname: '127.0.0.1',
		port: 5432
	}
});

export default setup;
