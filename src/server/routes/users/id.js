const db = require('modules/psql');
const util = require('modules/psql/util');

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
				let rows = util.createObject(result.rows);

				if(rows.length === 1) {
					await res.endJSON({
						'length': 1,
						'result': rows[0]
					});
				} else {
					await res.endJSON(400,{
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