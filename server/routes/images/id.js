const isJsonContent = require('modules/middleware/isJsonContent');

module.exports = [
	[
		{
			path: '/:id',
			methods: 'put'
		},
		isJsonContent(),
		async (req,res) => {
			await res.endJSON({
				'message': 'ok',
				'params': req.params
			});
		}
	],
	[
		{
			path: "/:id",
			methods: 'delete'
		},
		async (req,res) => {
			await res.endJSON({
				'message': 'ok'
			});
		}
	]
];