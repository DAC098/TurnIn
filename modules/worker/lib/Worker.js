const http2 = require('http2');
const EventEmitter = require('events');

class Worker extends EventEmitter{
	constructor() {
		super();

		this.connected = false;
		this.p = null;
		this.error = null;
		this.connecting = false;
		this.client = null;
		this.attached_listeners = false;
		this.created = false;

		this.location = {};
		this.ca = null;
	}

	connect(location,ca) {
		if(location)
			this.location = location;

		if(ca)
			this.ca = ca;

		this.p = new Promise((resolve,reject) => {
			this.connecting = true;
			let opts = {};

			if(this.ca)
				opts['ca'] = this.ca;

			let url = (this.location.secure ? 'https://' : 'http://') +
				this.location.host +
				(this.location.port ? `:${this.location.port}` : '') +
				'/';

			this.client = http2.connect(url,opts);

			this.created = true;

			this.client.setTimeout(0);

			this.client.once('connect',() => {
				this.connected = true;
				this.connecting = false;

				this.attachListeners();

				resolve();
			});

			this.client.once('error',err => {
				this.error = err;
				this.connecting = false;
				reject(err);
			});
		});

		return this.p;
	}

	close() {
		return new Promise((resolve) => {
			if(this.connected) {
				this.client.close(() => {
					resolve();
				});
			} else {
				resolve();
			}
		});
	}

	attachListeners() {
		if(this.connected && !this.attached_listeners) {
			this.attached_listeners = true;

			this.client.once('close',() => {
				console.log('worker connection closed');
				this.connected = false;
			});
		}
	}

	req(method,path,data) {
		return new Promise((resolve,reject) => {
			let head = {
				':path': path,
				':method': method.toUpperCase()
			};

			if(data) {
				head['content-type'] = 'application/json'
			}

			let req = this.client.request(head);
			let rtn = {};
			let finished = false;

			req.on('error',err => {
				if(!finished) {
					finished = true;
					reject(err);
				}
			});

			req.on('response',async (headers) => {
				rtn['headers'] = headers;
			});

			let body = '';

			req.on('data',chunk => {
				body += chunk;
			});

			req.on('end',() => {
				if(!finished) {
					finished = true;

					try {
						if(body.length > 0) {
							rtn['body'] = JSON.parse(body);
							resolve(rtn);
						} else {
							resolve(rtn);
						}
					} catch(err) {
						reject(err);
					}
				}
			});

			if(data) {
				req.write(JSON.stringify(data));
			}

			req.end();
		});
	}

	async awaitCon() {
		if(!this.created || this.client.destroyed ||
			(!this.connected && !this.connecting)
		) {
			await this.connect();
		}

		if(this.connecting && this.p !== null) {
			await this.p
		}
	}

	async isConnected() {
		await this.awaitCon();
		return this.connected;
	}

	async test() {
		if(!await this.isConnected())
			return false;

		let rtn = await this.req('get','/test');

		return rtn.headers[':status'] === 200;
	}

	/**
	 *
	 * @param assignment_id {number}
	 * @param submission_id {number}
	 * @returns {Promise<boolean>}
	 */
	async run(assignment_id,submission_id) {
		if(!await this.isConnected())
			return false;

		let rtn = await this.req('post','/run',{
			assignment_id,
			submission_id
		});

		return rtn.headers[':status'] === 202;
	}

	async updateFiles(opts) {
		if(!await this.isConnected())
			return false;

		let query = [];

		if(typeof opts.prevent_close === 'boolean') {
			if(opts.prevent_close)
				query.push('no_close=1');
		}

		if(typeof opts.force_close === 'boolean') {
			if(opts.force_close)
				query.push('force_close=1');
		}

		let url = `/close${query.length > 0 ? '?' + query.join('&') : ''}`;

		let rtn = await this.req('post',url,{file_update:opts.files});

		return rtn.headers[':status'] === 202;
	}
}

module.exports = Worker;