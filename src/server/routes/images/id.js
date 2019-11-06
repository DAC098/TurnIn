const isJsonContent = require('modules/middleware/isJsonContent');

const id_path ='/:id([0-9]+)';

module.exports = [
	[
		{
			path: id_path,
			methods: 'get'
		},
		async (req,res) => {
			await res.endJSON(req.image);
		}
	],
	[
		{
			path: id_path,
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
			path: id_path,
			methods: 'delete'
		},
		async (req,res) => {
			await res.endJSON({
				'message': 'ok'
			});
		}
	],
];