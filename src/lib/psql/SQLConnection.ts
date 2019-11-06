import * as pg from 'pg';

export default class SQLConnection {
	private released: boolean;
	private _c: pg.PoolClient;
	private transaction_started: boolean;

	constructor(connection: pg.PoolClient) {
		this._c = connection;
		this.released = false;
		this.transaction_started = false;
	}

	async query(sql: string | pg.QueryConfig, values?: any[]) {
		if(!this.released)
			return await this._c.query(sql,values);
		else
			return null;
	}
	
	async beginTrans(): Promise<void> {
		this.transaction_started = true;
		await this.query('BEGIN');
	}
	
	async commitTrans(): Promise<void> {
		if(this.transaction_started) {
			await this.query('COMMIT');
			this.transaction_started = false;
		}
	}
	
	async rollbackTrans(): Promise<void> {
		if(this.transaction_started) {
			await this.query('ROLLBACK');
			this.transaction_started = false;
		}
	}
	
	release() {
		if(!this.released) {
			this.released = true;
			this._c.release();
		}
	}

	isRelased() {
		return this.released;
	}
}