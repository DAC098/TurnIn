const _ = require('lodash');

const SQLWrapper = require('./SQLWrapper');

const default_interval_time = {
	hours: 5,
	minutes: 0,
	seconds: 0
};

const default_options = {
	create_default: true,
	default_conn: {}
};

class SQLPool {
	constructor(interval_time, common_connection, options) {
		this.connections = new Map();
		this.interval = null;
		this.interval_time = _.merge({},default_interval_time,interval_time);
		this.common_connection = _.clone(common_connection);
		this.options = _.merge({},default_options,options);

		if(this.options.create_default)
			this.createPool('default',this.options.default_conn);
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

	/**
	 *
	 * @param name    {string}
	 * @param options {Object=}
	 * @returns {SQLWrapper}
	 */
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

		let conn = {
			c: new SQLWrapper(config),
			last_used: Date.now(),
			options,
		};

		this.connections.set(name,conn);

		return conn.c
	}

	/**
	 *
	 * @param name {string}
	 * @returns {boolean}
	 */
	hasPool(name) {
		let conn = this.connections.get(name);

		return !!conn;
	}

	/**
	 *
	 * @param name {string}
	 * @returns {SQLWrapper|null}
	 */
	getPool(name = 'default') {
		let conn = this.connections.get(name);

		if(conn) {
			conn.last_used = Date.now();
			this.connections.set(name,conn);
			return conn.c;
		} else {
			return null;
		}
	}

	/**
	 *
	 * @param name {string}
	 * @returns {boolean}
	 */
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

	/**
	 *
	 * @param name {string}
	 * @returns {Promise<SQLConnection>}
	 */
	async connect(name) {
		let pool = this.getPool(name);

		if(pool !== null) {
			return await pool.connect();
		} else {
			return null;
		}
	}
}

module.exports = SQLPool;