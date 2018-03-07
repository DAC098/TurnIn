class SQLConnection {
	constructor(connection) {
		this._c = connection;
		this.released = false;
	}

	async query(sql,values) {
		if(!this.released)
			return await this._c.query(sql,values);
	}

	async begin() {
		await this.query('BEGIN');
	}

	async commit() {
		await this.query('COMMIT');
	}

	async rollbackTrans() {
		await this.query('ROLLBACK');
	}

	release() {
		if(!this.released) {
			this.released = true;
			this._c.release();
		}
	}
}

module.exports = SQLConnection;