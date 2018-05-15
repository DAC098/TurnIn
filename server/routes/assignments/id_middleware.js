const db = require('modules/psql');

const getAssignmentData = require('modules/psql/helpers/getAssignmentData');

module.exports = [
	[
		{
			name: 'assignment-check',
			path: '/:id([0-9]+)',
			type: 'mdlwr',
			methods: ['get','post','put','delete'],
			options: {
				end: false
			}
		},
		async (req,res) => {
			let con = null;

			try {
				con = await db.connect();

				let assignment = await getAssignmentData(req.params.id,con);

				con.release();

				if(assignment === undefined) {
					await res.endJSON(404,{
						'message': 'assignment not found in db'
					});
					return false;
				}

				req['assignment'] = assignment;
			} catch(err) {
				if(con)
					con.release();

				await res.endError(err);
				return false;
			}

			if(con)
				con.release();
		}
	]
];