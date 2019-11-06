import * as PSQL from 'pg';
import {default as _} from "lodash"

import SQLConnection from './SQLConnection';

const to_object_defaults = {
	array_keys: [],
	id_field: 'id',
	field_separator: '__'
};

class SQLWrapper {
	public closed: boolean;
	private _c: PSQL.Pool;

	constructor(config: PSQL.PoolConfig) {
		this._c = new PSQL.Pool(config);
		this.closed = false;
	}
	
	async connect() {
		return new SQLConnection(await this._c.connect());
	}
	
	async end() {
		await this._c.end();
		this.closed = true;
	}
}

export default SQLWrapper;