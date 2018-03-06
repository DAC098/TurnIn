const parseText = require('../parser/text');

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
			res.writeHead(200,{'content-type':'application/json'});
			res.end(JSON.stringify({'message':'ok','page':'root'}));
		}
	]
]
