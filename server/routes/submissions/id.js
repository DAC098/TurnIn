const db = require('modules/psql');

const id_path = '/:id([0-9]+)';

module.exports = [
	[
		{
			path: id_path,
			methods: 'get'
		},
		async (req,res) => {
			await res.endJSON(200,{
				'message': 'ok'
			});
		}
	]
];