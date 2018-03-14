const db = require('modules/psql');
const util = require('modules/psql/util');

module.exports = [
	[
		{
			path: '/',
			methods: 'get'
		},
		async (req,res) => {
			let con = null;

			try {
				let pool = db.getPool();
				con = await pool.connect();

				let query = `
				select
					students.id as id,
					students.user_id as user_id,
					students.fname as name__first,
					students.lname as name__last,
					users.email as email,
					users.username as username
				from students
				join users on
					users.id = students.user_id
				`;

				let result = await con.query(query);

				let rtn = util.createObject(result.rows);

				res.writeHead(200,{'content-type':'application/json'});
				await res.endJSON({
					'result': rtn
				});
			} catch(err) {
				await res.endError(err);
			}

			if(con)
				con.release();
		}
	]
];
