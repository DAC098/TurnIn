export default class SQLConnection {
    constructor(connection) {
        this._c = connection;
        this.released = false;
        this.transaction_started = false;
    }
    async query(sql, values) {
        if (!this.released)
            return await this._c.query(sql, values);
        else
            return null;
    }
    async beginTrans() {
        this.transaction_started = true;
        await this.query('BEGIN');
    }
    async commitTrans() {
        if (this.transaction_started) {
            await this.query('COMMIT');
            this.transaction_started = false;
        }
    }
    async rollbackTrans() {
        if (this.transaction_started) {
            await this.query('ROLLBACK');
            this.transaction_started = false;
        }
    }
    release() {
        if (!this.released) {
            this.released = true;
            this._c.release();
        }
    }
    isRelased() {
        return this.released;
    }
}
//# sourceMappingURL=SQLConnection.js.map