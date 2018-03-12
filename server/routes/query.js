const log = require('modules/log');
const db = require('modules/psql');

const checkAuthorization = require('modules/middleware/checkAuthorization');

const parseJson = require('../parser/json');

module.exports = [
	[
		{
			path: '/query',
			methods: 'post'
		},
		checkAuthorization,
		async (req,res) => {
			try {
				let body = await parseJson(req);

				if(!('query' in body)) {
					res.writeHead(400,{'content-type':'application/json'});
					await res.endJSONAsync({
						'message': 'no query present in body'
					});
					return;
				}

				if(typeof body['query'] !== 'string') {
					res.writeHead(400,{'content-type':'application/json'});
					await res.endJSONAsync({
						'message': 'query is not string'
					});
					return;
				}

				let pool = db.getPool();
				let con = await pool.connect();

				let result = await con.query(body.query);

				res.writeHead(200,{'content-type':'application/json'});
				await res.endJSONAsync({
					'results': result.rows
				});
			} catch(err) {
				res.writeHead(500,{'content-type':'application/json'});
				await res.endJSONAsync({
					'error': err.stack
				});
			}
		}
	]
];