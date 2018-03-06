const process = require('process');

module.exports = [
	[
		{
			path: '/close',
			methods: 'post'
		},
		async (req,res) => {
			res.writeHead(200,{'content-type':'text/plain'});
			res.end('closing server',() => {
				process.exit(0);
			});
		}
	]
]
