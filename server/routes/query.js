const log = require('modules/log');
const db = require('modules/psql');

const isJsonContent = require('modules/middleware/isJsonContent');

const checkAuthorization = require('modules/security/middleware/checkAuthorization');
const checkUserType = require('modules/security/middleware/checkUserType');

const parseJson = require('modules/parser/json');

module.exports = [
	[
		{
			path: '/query',
			methods: 'post'
		},
		checkAuthorization,
		checkUserType('master'),
		isJsonContent(),
		async (req,res) => {
			let con = null;
			try {
				let body = await parseJson(req);

				if(!('query' in body)) {
					await res.endJSON(400,{
						'message': 'no query present in body'
					});
					return;
				}

				if(typeof body['query'] !== 'string') {
					await res.endJSON(400,{
						'message': 'query is not string'
					});
					return;
				}

				let pool = db.getPool();
				con = await pool.connect();

				let result = await con.query(body.query);

				await res.endJSON({
					'results': result.rows
				});
			} catch(err) {
				await res.endError(err);
			}

			if(con)
				con.release();
		}
	]
];