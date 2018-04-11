const setup = require('modules/setup');
const log = require('modules/log');

const http2Server = require('modules/servers/http2');
const File = require('modules/fs/File');

const opts = {
	key: File.readSync(setup.getKey('tls.key')),
	cert: File.readSync(setup.getKey('tls.cert')),
	allowHTTP1: true
};

const server = new http2Server(opts,{secure: false});

module.exports = server;

const handle = require('./handle');

server.setHandle(async (req,res) => {
	await handle(req,res);
	log.debug('request complete');
});

server.on('error',err => {
	log.error(err.stack);
});

server.on('close',async () => {
	log.info('server closed',{
		connections: await server.getConnections()
	});
});

server.on('session',session => {
	session.on('close',() => {
		log.debug('session close',{uuid:session.pk});
	});

	session.on('error',err => {
		log.error(`session uuid:${session.pk}`,err.stack);
	});

	session.on('timeout',() => {
		log.debug('session timeout',{uuid:session.pk});
	});

	session.on('connect',(...args) => {
		log.debug('session connect',{uuid:session.pk});
	});

	log.debug('session connection',{uuid:session.pk});
});

server.on('connection',socket => {
	socket.on('close',() => {
		log.debug('socket close',{uuid:socket.pk});
	});

	socket.on('error',err => {
		log.debug(`socket uuid:${socket.pk}`,err.stack);
	});

	socket.on('timeout',() => {
		log.debug('socket timeout',{uuid:socket.pk});
	});

	log.debug('socket created',{uuid:socket.pk});
});