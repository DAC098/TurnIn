const SQLPool = require('./lib/SQLPool');

const db = new SQLPool();

db['util'] = require('./util');

module.exports = db;