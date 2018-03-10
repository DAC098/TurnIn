const isJsonContent = require('modules/middleware/isJsonContent');

module.exports = [
	[
		{
			path: '/login',
			methods: 'post'
		},
		isJsonContent(),
		async (req,res) => {
			res.writeHead(200,{'content-type':'application/json'});
			res.endJSON({'message':'ok'});
		}
	]
];