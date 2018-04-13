const n_path = require('path');

const setup = require('modules/setup');
const File = require('modules/fs/File');

module.exports = [
	[
		{
			path: '/:id([0-9]+)/results',
			methods: 'get'
		},
		async (req,res) => {
			let results_path = n_path.join(
				setup.getKey('directories.data_root'),
				'submissions',
				`${req.submission.id}`,
				'results',
				'data.json'
			);

			if(await File.exists(results_path)) {
				let json = JSON.parse(await File.read(results_path));

				await res.endJSON(json);
			} else {
				await res.endJSON(404,{
					'message': 'no results found'
				});
			}
		}
	]
];