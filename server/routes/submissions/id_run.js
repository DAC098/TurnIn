const wkr = require('modules/worker');
const log = require('modules/log');

module.exports = [
	[
		{
			path: '/:id([0-9]+)/run',
			methods: 'post'
		},
		async (req,res) => {
			let result = await wkr.run(req.submission.assignment_id,req.submission.id);

			await res.endJSON({
				'message': 'running ? ' + result
			});
		}
	]
];