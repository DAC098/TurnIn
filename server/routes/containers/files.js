const id_path = '/:id([0-9a-zA-Z_-]+)/files';

module.exports = [
	[
		{
			path: id_path,
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
			path: id_path,
			methods: 'post'
		},
		async (req,res) => {
			await res.endJSON({
				'message': 'ok'
			});
		}
	]
];