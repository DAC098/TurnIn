const db = require('modules/psql');
const wkr = require('modules/worker');
const log = require('modules/log');
const isJsonContent = require('modules/middleware/isJsonContent');

const id_submission_path = '/:id([0-9]+)/submissions';

module.exports = [
	[
		{
			path: id_submission_path,
			methods: 'get'
		},
		async (req,res) => {
			await res.endJSON(200,{
				'message': 'ok'
			});
		}
	],
	[
		{
			path: id_submission_path,
			methods: 'post'
		},
		isJsonContent(true),
		async (req,res) => {
			let running = await wkr.run(req.assignment.id,0);

			await res.endJSON(200,{
				'message': 'running container? ' + running
			});
		}
	]
];