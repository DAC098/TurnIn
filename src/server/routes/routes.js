const global = require('Router/global');

const router = require('../router');

module.exports = [
	[
		{
			path: '/routes',
			methods: 'get'
		},
		async (req,res) => {
			res.writeHead(200,{'content-type':'text/plain'});
			res.end(global.routerStructure(router));
		}
	]
];