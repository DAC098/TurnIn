const http2 = require('http2');
const EventEmitter = require('events');

const _ = require("lodash");

const security = require('../security');

/**
 *
 * @typedef {{
 *     secure: boolean=
 * }}
 */
const default_options = {
	secure: true
};

class http2Server extends EventEmitter {
	/**
	 *
	 * @param server_opts {Object}
	 * @param opts        {default_options}
	 */
	constructor(server_opts,opts) {
		super();

		this.opts = _.merge({},default_options,opts);
		this.server_opts = server_opts;
		this.known_sessions = new Map();
		this.known_sockets = new Map();
		this.instance = null;
		this.created = false;
		this.handle = null;
		this.handle_set = false;
	}

	create() {
		this.created = true;

		this.instance = this.opts.secure ?
			http2.createSecureServer(this.server_opts) :
			http2.createServer(this.server_opts);

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
				this.known_sessions.delete(session.pk);
			});

			this.emit('session',session);
		});

		this.instance.on('connection',socket => {
			socket.pk = security.uuidV4();
			this.known_sockets.set(socket.pk,socket);

			socket.on('close',() => {
				this.known_sockets.delete(socket.pk);
			});

			this.emit('connection',socket);
		});

		this.instance.on('close',async () => {
			let connections = await this.getConnections();

			if(connections > 0) {
				await this.closeConnections();
			}

			this.emit('close');
		});

		this.instance.on('error',err => {
			this.emit('error',err);
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
		this.closeSockets();
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

	async shutdown() {
		await this.closeConnections();
		await this.close();
	}

	listen(...args) {
		return new Promise((resolve,reject) => {
			this.instance.listen(...args,(err) => {
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