const db = require('modules/psql');

const getSubmissionData = require('modules/psql/helpers/getSubmissionData');

const id_path = '/:id([0-9]+)';

module.exports = [
	[
		{
			name: 'submission-check',
			path: id_path,
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

				let submission = await getSubmissionData(req.params.id,con);

				con.release();

				if(typeof submission === 'undefined') {
					await res.endJSON(404,{
						'message': 'submission not found'
					});
					return false;
				}

				req.submission = submission;

			} catch(err) {
				if(con)
					con.release();

				await res.endError(err);
				return false;
			}
		}
	],
	[
		{
			path: id_path,
			methods: 'get'
		},
		async (req,res) => {
			await res.endJSON(200,{
				'length': 1,
				'result': [req.submission]
			});
		}
	]
];