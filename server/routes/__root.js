const parseText = require('modules/parser/text');

module.exports = [
	[
		{
			path: '/',
			methods: 'post'
		},
		async (req,res) => {
			res.writeHead(200,{'content-type':'text/plain'});
			let body = await parseText(req);
			res.end(body);
		}
	],
	[
		{
			path: '/',
			methods: 'get'
		},
		async (req,res) => {
			await res.endJSON({
				'message':'ok',
				'page':'root',
				'headers': req.headers
			});
		}
	]
];
