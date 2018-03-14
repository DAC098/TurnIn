module.exports = [
	[
		{
			path: '/:id/files',
			methods: 'get'
		},
		async (req,res) => {
			res.writeHead(200,{'content-type':'application/json'});
			await res.endJSON({
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
			await res.endJSON({
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
			await res.endJSON({
				'message':'ok'
			});
		}
	]
];