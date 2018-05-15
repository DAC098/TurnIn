const db = require('modules/psql');

const getImageData = require('modules/psql/helpers/getImageData');

module.exports = [
	[
		{
			name: 'image-check',
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

				let image = await getImageData(req.params.id,con);
				let found = image !== undefined;

				if(!found) {
					await res.endJSON(404,{
						'message': 'image not found in database'
					});
					return false;
				}

				req['image'] = image;

				con.release();
			} catch(err) {
				if(con)
					con.release();

				await res.endError(err);
				return false;
			}
		}
	]
];