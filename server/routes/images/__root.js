const isJsonContent = require('modules/middleware/isJsonContent');

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
			res.writeHead(200,{'content-type':'application/json'});
			res.endJSONAsync({
				'message': 'ok'
			});
		}
	]
];
