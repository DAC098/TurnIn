module.exports = [
	[
		{
			path: '/:id/files',
			methods: 'get'
		},
		async (req,res) => {
			await res.endJSON({
				'message':'ok'
			});
		}
	],
	[
		{
			path: '/:id/files',
			methods: 'post'
		},
		async (req,res) => {
			await res.endJSON({
				'message':'ok'
			});
		}
	],
	[
		{
			path: '/:id/files',
			methods: 'delete'
		},
		async (req,res) => {
			await res.endJSON({
				'message':'ok'
			});
		}
	]
];