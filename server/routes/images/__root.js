const db = require('modules/psql');

const listImages = require('modules/psql/helpers/images/listImages');
const createImage = require('modules/psql/helpers/images/createImage');

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
				let options  = {};

				if(req.user.type === 'master' || req.user.permission.image.modify) {
					options.below_user = req.user.type;
				} else {
					options.owner_id = req.user.id;
				}

				let result = await listImages(options,con);

				await res.endJSON(result);
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
				con = await db.connect();

				let body = await parser.json(req);

				let result = await createImage(req.user,body,con);

				if(result.success) {
					await res.endJSON(result.image);
				} else {
					await res.endJSON(400,{
						'message': result.reason
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
