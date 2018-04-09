const http2 = require('http2');
const EventEmitter = require('events');

const security = require('../security');

class http2Server extends EventEmitter {
	constructor(opts) {
		super();

		this.opts = opts;
		this.known_sessions = new Map();
		this.known_sockets = new Map();
		this.instance = null;
		this.created = false;
		this.handle = null;
		this.handle_set = false;
	}

	create() {
		let self = this;
		this.created = true;
		this.instance = http2.createSecureServer(this.opts);

		this.instance.on('request',async (req,res) => {
			if(!this.handle_set) {
				req.writeHead(200,{'content-type':'text/plain'});
				req.end('ok');
			}

			let rtn = this.handle(req,res);

			if(typeof rtn.then === 'function') {
				await rtn;
			}
		});

		this.instance.on('session',session => {
			session.pk = security.uuidV4();
			this.known_sessions.set(session.pk,session);

			session.closeAsync = () => {
				return new Promise((resolve, reject) => {
					if(!session.closed && !session.destroyed) {
						session.close(() => {
							this.known_sockets.delete(this.pk);
							resolve();
						});
					} else {
						this.known_sockets.delete(this.pk);
						resolve();
					}
				});
			};

			session.on('close',async () => {
				this.emit('session-close',session.pk);

				self.known_sessions.delete(session.pk);
			});

			session.on('error',err => {
				this.emit('session-error',session.pk,err);
			});

			session.on('timeout',() => {
				this.emit('session-timeout',session.pk);
			});

			session.on('connect',(...args) => {
				this.emit('session-connect',session.pk);
			});

			this.emit('session-created',session.pk);
		});

		this.instance.on('connection',socket => {
			socket.pk = security.uuidV4();
			this.known_sockets.set(socket.pk,socket);

			socket.on('close',() => {
				this.emit('socket-close',socket.pk);
				this.known_sockets.delete(socket.pk);
			});

			socket.on('error',err => {
				this.emit('socket-error',socket.pk,err);
			});

			socket.on('timeout',() => {
				this.emit('socket-timeout',socket.pk);
			});

			this.emit('socket-created',socket.pk);
		});

		this.instance.on('close',async () => {
			let connections = await this.getConnections();

			if(connections > 0) {
				await this.closeConnections();
			}
		});
	}

	async closeSessions() {
		for(let [pk,session] of this.known_sessions) {
			await session.closeAsync();
		}
	}

	closeSockets() {
		for(let [pk,socket] of this.known_sockets) {
			if(!socket.destroyed) {
				socket.destroy();
			}

			this.known_sockets.delete(pk);
		}
	}

	getConnections() {
		return new Promise((resolve,reject) => {
			this.instance.getConnections((err,count) => {
				if(err)
					reject(err);
				else
					resolve(count);
			});
		});
	}

	async closeConnections() {
		await this.closeSessions();
		await this.closeSockets();
	}

	close() {
		return new Promise((resolve,reject) => {
			this.instance.close(err => {
				if(err)
					reject(err);
				else
					resolve();
			});
		});
	}

	listen(...args) {
		return new Promise((resolve,reject) => {
			this.listen(...args,(err) => {
				if(err)
					reject(err);
				else
					resolve();
			});
		});
	}

	setHandle(cb) {
		this.handle = cb;
		this.handle_set = true;
	}
}

module.exports = http2Server;