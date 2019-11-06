import {PoolConfig} from "pg";
import {default as _} from "lodash"

import SQLWrapper from './SQLWrapper';

interface IntervalTime {
	hours: number,
	minutes: number,
	seconds: number
};

const default_interval_time = {
	hours: 5,
	minutes: 0,
	seconds: 0
};

interface Connection {
	c: SQLWrapper,
	last_used: number,
	config: PoolConfig
}

interface SQLPoolOptions {
	create_default: boolean,
	default_conn: PoolConfig
}

const default_options = {
	create_default: true,
	default_conn: {}
};

export default class SQLPool {
	private connections: Map<string,Connection>;
	private interval: NodeJS.Timeout;
	private interval_time: IntervalTime;
	private common_connection: PoolConfig;
	private options: SQLPoolOptions

	constructor(interval_time, common_connection, options) {
		this.connections = new Map();
		this.interval = null;
		this.interval_time = _.merge({},default_interval_time,interval_time);
		this.common_connection = _.clone(common_connection);
		this.options = _.merge({},default_options,options);

		if(this.options.create_default)
			this.createPool(this.options.default_conn,'default');
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
	
	createPool(options: PoolConfig, name: string = 'default') {
		if(this.connections.has(name)) {
			let conn = this.connections.get(name);

			conn.last_used = Date.now();

			if(typeof options === 'object') {
				let config = _.merge({},conn.config,options);
				conn.c = new SQLWrapper(config);
				conn.config = config;
			}

			this.connections.set(name,conn);

			return conn.c;
		}

		let config = _.merge({},this.common_connection,options);

		let conn = {
			c: new SQLWrapper(config),
			last_used: Date.now(),
			config,
		};

		this.connections.set(name,conn);

		return conn.c
	}
	
	hasPool(name: string): boolean {
		let conn = this.connections.get(name);

		return !!conn;
	}
	
	getPool(name: string = 'default'):  SQLWrapper|null {
		let conn = this.connections.get(name);

		if(conn) {
			conn.last_used = Date.now();
			this.connections.set(name,conn);
			return conn.c;
		} else {
			return null;
		}
	}
	
	updatePool(name): boolean {
		let conn = this.connections.get(name);

		if(conn) {
			conn.last_used = Date.now();
			this.connections.set(name,conn);
			return true;
		} else {
			return false;
		}
	}
	
	async connect(name) {
		let pool = this.getPool(name);

		if(pool !== null) {
			return await pool.connect();
		} else {
			return null;
		}
	}

	setCommonConnection(common) {
		this.common_connection = _.clone(common);
	}

	setDefaultOptions(options) {
		this.options = _.merge({},this.options,options);
	}
}