const db = require('modules/psql');

const id_assignment_path = '/:id([0-9]+)/assignments';

module.exports = [
	[
		{
			path: id_assignment_path,
			methods: 'get'
		},
		async (req,res) => {
			let con = null;

			try {
				con = await db.connect();

				let query = `
				select 
					assignments.* 
				from assignments
				join sections on
					sections.id = assignments.section_id
				where
					sections.id = ${req.params.id}
				`;

				let result = await con.query(query);

				await res.endJSON({
					'length': result.rows.length,
					'result': result.rows
				});
			} catch(err) {
				await res.endError(err);
			}

			if(con)
				con.release();
		}
	]
];