module.exports = [
	[
		{
			path: '/:id/files',
			methods: 'get'
		},
		async (req,res) => {
			res.writeHead(200,{'content-type':'application/json'});
			res.endJSONAsync({
				'message':'ok'
			});
		}
	],
	[
		{
			path: '/:id/files',
			methods: 'post'
		},
		async (req,res) => {
			res.writeHead(200,{'content-type':'application/json'});
			res.endJSONAsync({
				'message':'ok'
			});
		}
	],
	[
		{
			path: '/:id/files',
			methods: 'delete'
		},
		async (req,res) => {
			res.writeHead(200,{'content-type':'application/json'});
			res.endJSONAsync({
				'message':'ok'
			});
		}
	]
];