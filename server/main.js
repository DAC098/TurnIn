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

const server = new http2Server(opts,{secure:true});

module.exports = server;

server.setHandle(async (req,res) => {
	await handle(req,res);
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

	session.on('localSettings',obj => {
		log.debug('session local settings',{...obj,uuid:session.pk});
	});

	session.on('remoteSettings',obj => {
		log.debug('session remote settings',{...obj,uuid:session.pk});
	});

	log.debug('session connection',{uuid:session.pk,alpn:session.alpnProtocol});
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

server.on('unknownProtocol',(socket) => {
	log.debug('unknown protocol requested',{socket});

	socket.destroy();
});
