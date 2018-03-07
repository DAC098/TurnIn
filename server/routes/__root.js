const parseText = require('../parser/text');

module.exports = [
	[
		{
			type: 'mdlwr',
			path: '/',
			methods: ['get','post','put','delete'],
			regex: /\//
		},
		async (req,res) => {
			res['endJSON'] = function(obj) {
				this.end(JSON.stringify(obj));
			};
		}
	],
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
];
