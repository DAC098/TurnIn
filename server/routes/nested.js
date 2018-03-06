module.exports = [
	[
		{
			path: '/nested',
			methods: 'get'
		},
		async (req,res) => {
			res.writeHead(200,{'content-type':'text/plain'});
			res.end('ok');
		}
	]
]
