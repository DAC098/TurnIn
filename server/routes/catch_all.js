module.exports = [
	[
		{
			path: '/*',
			methods: ['get','post','put','delete']
		},
		async (req,res) => {
			res.writeHead(200,{'content-type':'text/plain'});
			res.end('catch all');
		}
	]
]
