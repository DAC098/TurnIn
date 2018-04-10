const setup = require('modules/setup');
const log = require('modules/log');

const http2Server = require('modules/servers/http2');
const File = require('modules/fs/File');

const handle = require('./handle');

const opts = {
	key: File.readSync(setup.getKey('tls.key')),
	cert: File.readSync(setup.getKey('tls.cert')),
	allowHTTP1: true
};

const server = new http2Server(opts);

server.setHandle(async (req,res) => {
	await handle(req,res);
});

server.on('error',err => {
	log.error(err.stack);
});

server.on('session-close',pk => {
	log.debug('session close',{uuid:pk});
});

server.on('session-error',(pk,err) => {
	log.error(`session uuid:${pk}`,err.stack);
});

server.on('session-timeout',pk => {
	log.debug('session timeout',{uuid:pk});
});

server.on('session-connect',pk => {
	log.debug('session connect',{uuid:pk});
});

server.on('session-created',pk => {
	log.debug('session connection',{uuid:pk});
});

server.on('socket-close',pk => {
	log.debug('socket close',{uuid:pk});
});

server.on('socket-error',(pk,err) => {
	log.debug(`socket uuid:${pk}`,err.stack);
});

server.on('socket-timeout',pk => {
	log.debug('socket timeout',{uuid:pk});
});

server.on('socket-created',pk => {
	log.debug('socket created',{uuid:pk});
});

module.exports = server;