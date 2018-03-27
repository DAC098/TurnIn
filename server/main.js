const http2 = require('http2');
const fs = require('fs');
const process = require('process');

const setup = require('modules/setup');
const log = require('modules/log');

const handle = require('./handle');

const opts = {
	key: fs.readFileSync(setup.getKey('tls.key')),
	cert: fs.readFileSync(setup.getKey('tls.cert')),
	allowHTTP1: true
};

const server = http2.createSecureServer(opts, handle);

server.on('listening',err => {
	if(err)
		log.error(err.stack);
	else
		log.info('server listening for connections, https://0.0.0.0:443');
});

server.on('connection',async soc => {
	log.info('connection',{total: await server.getConnectionsAsync()});
});

server.on('close',() => {
	log.info('server closed, no active connections');
});

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
		await this.closeAsync();
		process.exit(0);
	} catch(err) {
		log.error(err.stack);
	}
};

server.listen(443,'0.0.0.0');

log.info('server',require('util').inspect(server,{depth:0}));

module.exports = server;
