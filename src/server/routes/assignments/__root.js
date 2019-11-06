const db = require('modules/psql');

const createAssignment = require('modules/psql/helpers/assignments/createAssignment');

const isJsonContent = require('modules/middleware/isJsonContent');
const parser = require('modules/parser');

module.exports = [
	[
		{
			path: '/',
			methods: 'get'
		},
		async (req,res) => {
			let con = null;

			try {
				con = await db.connect();

				let query = `
				select
					*
				from assignments
				`;

				let results = await con.query(query);

				await res.endJSON(results.rows);
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
			let con = null;

			try {
				let body = await parser.json(req);

				await con.beginTrans();

				let assignment = await createAssignment(req.user,body,con);

				if(assignment.success) {
					await con.commitTrans();

					await res.endJSON(assignment.assignment);
				} else {
					await con.rollbackTrans();

					await res.endJSON(400,{
						'message': assignment.reason
					});
				}

				con.release();
			} catch(err) {
				if(con) {
					await con.rollbackTrans();
					con.release();
				}

				await res.endError(err,'unable to create assignment');
			}
		}
	]
];
