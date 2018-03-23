const PSQL = require('pg');
const _ = require('lodash');

const SQLConnection = require('./SQLConnection');

const to_object_defaults = {
	array_keys: [],
	id_field: 'id',
	field_separator: '__'
};

class SQLWrapper {
	constructor(config) {
		this._c = new PSQL.Pool(config);
		this.closed = false;
	}

	/**
	 *
	 * @returns {Promise<SQLConnection>}
	 */
	async connect() {
		return new SQLConnection(await this._c.connect())
	}

	/**
	 *
	 * @returns {Promise<void>}
	 */
	async end() {
		await this._c.end();
		this.closed = true;
	}
}

module.exports = SQLWrapper;