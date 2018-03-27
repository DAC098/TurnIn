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
let known_connections = new Map();

const server = http2.createSecureServer(opts, handle);

server.on('listening',err => {
	if(err)
		log.error(err.stack);
	else
		log.info('server listening for connections, https://0.0.0.0:443');
});

server.on('connection',async soc => {
	soc.pk = security.uuid('socket_connection');
	known_connections.set(soc.pk,soc);

	soc.on('close',() => {
		known_connections.delete(soc.pk);
	});

	soc.on('error',err => {
		log.error(err.stack);
	});

	log.debug('connection',{uuid: soc.pk,total: await server.getConnectionsAsync()});
});

server.on('close',() => {
	log.info('server closed, no active connections');
});

server.closeConnections = () => {
	for(let [pk,soc] of known_connections) {
		soc.end();
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
	log.warn('attempting to close and exit server',{connections: await this.getConnectionsAsync()});

	try {
		if(await this.getConnectionsAsync() !== 0) {
			log.info('closing connections');
			this.closeConnections();
		}

		await this.closeAsync();
		process.exit(0);
	} catch(err) {
		log.error(err.stack);
	}
};

server.listen(443,'0.0.0.0');

module.exports = server;
