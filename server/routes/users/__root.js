const db = require('modules/psql');

const isJsonContent = require('modules/middleware/isJsonContent');

const createUser = require('modules/psql/helpers/createUser');

const parseJson = require('../../parser/json');

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
						is_student,
						is_teacher,
						fname,
						lname
					from users
					where
						type > '${req.user.type}'
					order by
						type, username
				`;

				let result = await con.query(query);

				res.writeHead(200,{'content-type':'application/json'});
				await res.endJSON({'result':result.rows});
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
					res.writeHead(400,{'content-type':'application/json'});
					await res.endJSON({
						'message': result.reason
					});
				} else {
					res.writeHead(200,{'content-type':'application/json'});
					await res.endJSON({
						'result': result.user
					});
				}
			} catch(err) {
				await res.endError(err);
			}
		}
	]
];