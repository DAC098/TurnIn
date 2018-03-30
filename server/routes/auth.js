module.exports = [
	[
		{
			path: '/auth',
			methods: 'post'
		},
		async (req,res) => {
			await res.endJSON({
				'message': 'ok'
			});
		}
	]
];