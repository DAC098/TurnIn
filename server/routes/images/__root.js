module.exports = [
	[
		{
			path: '/',
			methods: 'get'
		},
		async (req,res) => {
			res.writeHead(200,{'content-type':'application/json'});
			res.endJSON({'message':'ok'});
		}
	]
];
