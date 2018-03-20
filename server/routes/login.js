const isJsonContent = require('modules/middleware/isJsonContent');

module.exports = [
	[
		{
			path: '/login',
			methods: 'post'
		},
		isJsonContent(),
		async (req,res) => {
			await res.endJSON({'message':'ok'});
		}
	]
];