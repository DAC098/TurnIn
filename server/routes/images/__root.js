const db = require('modules/psql');

const isJsonContent = require('modules/middleware/isJsonContent');

const parser = require('modules/parser');

module.exports = [
	[
		{
			path: '/',
			methods: 'get'
		},
		async (req,res) => {
			await res.endJSON({'message':'ok'});
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
				let query = `
				INSERT INTO images (
					image_name,
					
				`;
				await res.endJSON({
					'message': 'ok'
				});
			} catch(err) {
				await res.endError(err);
			}
		}
	]
];
