module.exports = [
	[
		{
			path: '/',
			methods: 'get'
		},
		async (req,res) => {
			await res.endJSON({'message':'ok'});
		}
	]
];
