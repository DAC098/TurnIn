const db = require('modules/psql');

const isJsonContent = require('modules/middleware/isJsonContent');

const parseJson = require('../../parser/json');

module.exports = [
	[
		{
			path: '/',
			methods: 'get'
		},
		async (req,res) => {
			res.writeHead(200,{'content-type':'application/json'});
			res.endJSON({'message':'ok'});
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
				res.writeHead(200,{'content-type':'application/json'});
				res.endJSONAsync({
					'message': 'ok'
				});
			} catch(err) {

			}
		}
	]
];
