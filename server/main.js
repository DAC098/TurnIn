const http2 = require('http2');
const process = require('process');

const setup = require('modules/setup');
const log = require('modules/log');
const security = require('modules/security');

const File = require('modules/fs/File');

const handle = require('./handle');

const opts = {
	key: File.readSync(setup.getKey('tls.key')),
	cert: File.readSync(setup.getKey('tls.cert')),
	allowHTTP1: true
};
let known_sessions = new Map();
let known_connections = new Map();

const server = http2.createSecureServer(opts, handle);

server.on('session',session => {
	session.pk = security.uuidV4();
	known_sessions.set(session.pk,session);

	session.closeAsync = function() {
		return new Promise((resolve, reject) => {
			session.close(() => {
				resolve();
			});
		});
	};

	session.on('close',() => {
		log.debug('session close',{uuid:session.pk});
		known_sessions.delete(session.pk);
	});

	session.on('error',err => {
		log.error('session',err.stack);
	});

	session.on('timeout',() => {
		log.debug('session timeout',{uuid:session.pk});
	});

	log.debug('session connection',{uuid:session.pk});
});

server.on('connection',async soc => {
	soc.pk = security.uuidV4();
	known_connections.set(soc.pk,soc);

	soc.on('close',() => {
		log.debug('socket close',{uuid:soc.pk});
		known_connections.delete(soc.pk);
	});

	soc.on('error',err => {
		log.error('socket',err.stack);
	});

	soc.on('timeout',() => {
		log.debug('socket timeout',{uuid:soc.pk});
	});

	log.debug('socket connection',{uuid:soc.pk});
});

server.on('close',async () => {
	log.info('server closed',{connections:await server.getConnectionsAsync()});
});

server.closeSessions = async () => {
	for(let [pk,session] of known_sessions) {
		if(!session.closed)
			await session.closeAsync();
	}
};

server.closeConnections = () => {
	for(let [pk,soc] of known_connections) {
		if(!soc.destroyed) {
			soc.destroy();
		}

		known_connections.delete(pk);
	}
};

server.closeAsync = async function() {
	return new Promise((resolve,reject) => {
		this.close(err => {
			if(err)
				reject(err);
			else
				resolve();
		});
	});
};

server.getConnectionsAsync = function() {
	return new Promise((resolve,reject) => {
		this.getConnections((err,count) => {
			if(err)
				reject(err);
			else
				resolve(count);
		});
	});
};

server.closeAndExit = async function() {
	log.warn('attempting to close and exit server',{
		connections: await this.getConnectionsAsync()
	});

	try {
		log.info('closing sessions');
		await this.closeSessions();

		log.info('closing connections');
		this.closeConnections();

		await this.closeAsync();

		process.exit(0);
	} catch(err) {
		log.error(err.stack);
	}
};

server.listenAsync = function (...args) {
	return new Promise((resolve,reject) => {
		this.listen(...args,(err) => {
			if(err)
				reject(err);
			else
				resolve();
		});
	});
};

module.exports = server;
