const db = require('modules/psql');
const util = require('modules/psql/util');
const createUser = require('modules/psql/helpers/users/createUser');

const isJsonContent = require('modules/middleware/isJsonContent');

const parseJson = require('modules/parser/json');

module.exports = [
	[
		{
			path: "/",
			methods: "get"
		},
		async (req,res) => {
			let con = null;

			try {
				let pool = db.getPool();
				con = await pool.connect();

				let query = `
					select
						id,
						username,
						email,
						permissions,
						type,
						fname as name__first,
						lname as name__last
					from users
					where
						type > '${req.user.type}'
					order by
						type, username
				`;

				let result = await con.query(query);

				let rows = util.createObject(result.rows);
				await res.endJSON({
					'length': rows.length,
					'result': rows
				});
			} catch(err) {
				await res.endError(err);
			}

			if(con)
				con.release();
		}
	],
	[
		{
			path: '/',
			methods: 'post'
		},
		isJsonContent(),
		async (req,res) => {
			try {
				let body = await parseJson(req);
				let result = await createUser(req.user,body);

				if(!result.success) {
					await res.endJSON(400,{
						'message': result.reason
					});
				} else {
					await res.endJSON({
						'length': 1,
						'result': [result.user]
					});
				}
			} catch(err) {
				await res.endError(err);
			}
		}
	]
];