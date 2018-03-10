const isJsonContent = require('modules/middleware/isJsonContent');

module.exports = [
	[
		{
			path: '/:id',
			methods: 'put'
		},
		isJsonContent(),
		async (req,res) => {
			res.writeHead(200,{'content-type':'application/json'});
			res.endJSONAsync({
				'message': 'ok',
				'params': req.params
			});
		}
	],
	[
		{
			path: "/:id",
			methods: 'delete'
		},
		async (req,res) => {
			res.writeHead(200,{'content-type':'application/json'});
			res.endJSONAsync({
				'message': 'ok'
			});
		}
	]
];