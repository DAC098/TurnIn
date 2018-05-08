const n_path = require('path');

const setup = require('modules/setup');
const File = require('modules/fs/File');

module.exports = [
	[
		{
			path: '/:id([0-9]+)/tests',
			methods: 'get'
		},
		async (req,res) => {
			let tests_path = n_path.join(
				setup.helpers.getSubmissionDir(req.submission.id),
				'results',
				'tests.json'
			);

			if(await File.exists(tests_path)) {
				let json = JSON.parse(await File.read(tests_path));

				await res.endJSON(json);
			} else {
				await res.endJSON(404,{
					'message': 'no tests found'
				});
			}
		}
	]
];