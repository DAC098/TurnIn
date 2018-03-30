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
let known_sockets = new Map();

const server = http2.createSecureServer(opts);

server.closeSessions = async () => {
	for(let [pk,session] of known_sessions) {
		await session.closeAsync();
	}
};

server.closeSockets = () => {
	for(let [pk,socket] of known_sockets) {
		if(!socket.destroyed) {
			socket.destroy();
		}

		known_sockets.delete(pk);
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

server.closeConnections = async function() {
	await this.closeSessions();
	await this.closeSockets();
};

server.closeAndExit = async function() {
	try {
		await this.closeConnections();

		if(this.listening)
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

server.on('request',async (req,res) => {
	await handle(req,res);
});

/*
there is a difference between the session and a connection.
the session can be closed / destroyed but it is still possible
for a connection to exist.
example: if a request from chrome is made, the connection will
stay open while the chrome is open only when chrome is closed will
the connection also close (as of right now)
 */
server.on('session',session => {
	session.pk = security.uuidV4();
	known_sessions.set(session.pk,session);

	session.closeAsync = function() {
		return new Promise((resolve, reject) => {
			if(!this.closed && !this.destroyed) {
				this.close(() => {
					known_sockets.delete(this.pk);
					resolve();
				});
			} else {
				known_sockets.delete(this.pk);
				resolve();
			}
		});
	};

	session.on('close',async () => {
		log.debug('session close',{
			uuid:session.pk
		});

		known_sessions.delete(session.pk);
	});

	session.on('error',err => {
		log.error('session',err.stack);
	});

	session.on('timeout',() => {
		log.debug('session timeout',{uuid:session.pk});
	});

	session.on('connect',(...args) => {
		log.debug('session connect',args);
	});

	log.debug('session connection',{
		uuid:session.pk,
		remote:session.socket.remoteAddress,
		local:session.socket.localAddress
	});
});

server.on('connection',async socket => {
	socket.pk = security.uuidV4();
	known_sockets.set(socket.pk,socket);

	socket.on('close',() => {
		log.debug('socket close',{uuid:socket.pk});
		known_sockets.delete(socket.pk);
	});

	socket.on('error',err => {
		log.error('socket',err.stack);
	});

	socket.on('timeout',() => {
		log.debug('socket timeout',{uuid:socket.pk});
	});

	log.debug('socket connection',{
		uuid:socket.pk,
		remote:socket.remoteAddress,
		local:socket.localAddress
	});
});

server.on('close',async () => {
	let connections = await server.getConnectionsAsync();

	log.info('server closed',{
		connections
	});

	if(connections > 0) {
		log.info('attempting to close connections');
		await server.closeConnections();
	}
});

module.exports = server;
