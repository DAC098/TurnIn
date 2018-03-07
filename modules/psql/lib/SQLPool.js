const _ = require('lodash');

const SQLWrapper = require('./SQLWrapper');

const default_interval_time = {
	hours: 5,
	minutes: 0,
	seconds: 0
};

class SQLPool {
	constructor(interval_time,common_connection) {
		this.connections = new Map();
		this.interval = null;
		this.interval_time = _.merge({},default_interval_time,interval_time);
		this.common_connection = _.clone(common_connection);
	}

	createInterval() {
		let time = this.getIntervalTime();
		this.interval = setInterval(() => this.checkPools(),time > 2147483647 ? 3600000 * 24 : time);
	}

	getIntervalTime() {
		return (1000 * (this.interval_time.seconds > 60 ? 60 : this.interval_time.seconds)) +
		       (60000 * (this.interval_time.minutes > 60 ? 60 : this.interval_time.minutes)) +
		       (3600000 * (this.interval_time.hours > 24 ? 24 : this.interval_time.hours));
	}

	checkPools() {
		let now = Date.now();
		let time = this.getIntervalTime() / 1000;
		let closing = [];

		for(let [k,v] of this.connections) {
			let diff = now - v.last_used;

			if(diff > time && !v.c.closed) {
				closing.push(v.c.end());
			}
		}

		return Promise.all(closing);
	}

	createPool(name,options) {
		if(this.connections.has(name)) {
			let conn = this.connections.get(name);

			conn.last_used = Date.now();

			if(conn.c.closed) {
				conn.c = new SQLWrapper(_.merge({},this.common_connection,conn.options));
			}

			this.connections.set(name,conn);

			return conn.c;
		}

		let config = _.merge({},this.common_connection,options);
		console.log('connection info',config);

		let conn = {
			c: new SQLWrapper(config),
			last_used: Date.now(),
			options,
		};

		this.connections.set(name,conn);

		return conn.c
	}

	hasPool(name) {
		let conn = this.connections.get(name);

		return !!conn;
	}

	getPool(name) {
		let conn = this.connections.get(name);

		if(conn) {
			conn.last_used = Date.now();
			this.connections.set(name,conn);
			return conn.c;
		} else {
			return null;
		}
	}

	updatePool(name) {
		let conn = this.connections.get(name);

		if(conn) {
			conn.last_used = Date.now();
			this.connections.set(name,conn);
			return true;
		} else {
			return false;
		}
	}
}

module.exports = SQLPool;