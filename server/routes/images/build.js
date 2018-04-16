const db = require('modules/psql');
const wkr = require('modules/worker');
const listImages = require('modules/psql/helpers/images/listImages');

module.exports = [
	[
		{
			path: '/:id([0-9]+)/build',
			methods: 'post'
		},
		async (req,res) => {
			let con = null;

			try {
				con = await db.connect();

				let result = await listImages({
					check_owner: req.user.id,
					id: parseInt(req.params.id,10)
				},con);

				if(con)
					con.release();

				if(result.length === 0) {
					await res.endJSON(404,{
						'message': 'image not found'
					});
				} else {
					let image = result[0];

					if(image.is_owner) {
						// begin to build the file
						let response = await wkr.build(image.id);
						await res.endJSON(response);
					} else {
						if(req.user.type === 'master' || req.user.permission.images.modify) {
							// begin to build the file
							let response = await wkr.build(image.id);
							await res.endJSON(response);
						} else {
							await res.endJSON(401,{
								'message': 'you do not have permission to build this image'
							});
						}
					}
				}
			} catch(err) {
				if(con)
					con.release();

				await res.endError(err);
			}
		}
	]
];