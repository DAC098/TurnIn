const db = require('modules/psql');

module.exports = [
	[
		{
			name: 'section-check',
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

				let query = `
				select
					*
				from sections
				where
					id = ${req.params.id}
				`;

				let result = await con.query(query);

				if(result.rows.length === 0) {
					await res.endJSON(404,{
						'message': 'section not found'
					});
					return false;
				}
			} catch(err) {
				if(con)
					con.release();

				await res.endError(err);
				return false;
			}
		}
	]
];