const db = require('modules/psql');

const isJsonContent = require('modules/middleware/isJsonContent');

const parseJson = require('modules/parser/json');

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
			try {
				let body = await parseJson(req);
				let query = `
				INSERT INTO images (
					image_name,
					
				`;
				await res.endJSON({
					'message': 'ok'
				});
			} catch(err) {

			}
		}
	]
];
