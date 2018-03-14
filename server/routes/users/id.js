const db = require('modules/psql');

module.exports = [
	[
		{
			path: '/:id([0-9]{1,})',
			methods: 'delete'
		},
		async (req,res) => {
			let con = null;

			try {
				let pool = db.getPool();
				con = await pool.connect();

				let query = `
				delete from users
				where
					id = ${req.params.id}
				returning
					id,
					username,
					email,
					permissions,
					type,
					is_student,
					is_teacher,
					fname,
					lname`;

				let result = await con.query(query);

				if(result.rows.length === 1) {
					res.writeHead(200,{'content-type':'application/json'});
					await res.endJSON({
						'result': result.rows[0]
					});
				} else {
					res.writeHead(400,{'content-type':'application/json'});
					await res.endJSON({
						'message': 'unable to delete user'
					});
				}
			} catch(err) {
				await res.endError(err);
			}

			if(con)
				con.release();
		}
	]
];