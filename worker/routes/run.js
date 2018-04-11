const db = require('modules/psql');
const log = require('modules/log');

const containers = require('modules/docker/containers');
const parser = require('modules/parser');
const isJsonContent = require('modules/middleware/isJsonContent');

const getAssignmentData = require('modules/psql/helpers/getAssignmentData');
const getSubmissionData = require('modules/psql/helpers/getSubmissionData');

const router = require('../router');

const route_info = {
	path: '/run',
	methods: 'post'
};

router.addRoute(route_info,isJsonContent(), async (req,res) => {
	let con = null;
	/**
	 *
	 * @type {{
	 *     assignment_id: number,
	 *     submission_id: number
	 * }}
	 */
	let run_request = {};
	let assignment_info = {};
	let submission_info = {};

	try {
		con = await db.connect();

		run_request = await parser.json(req);

		assignment_info = await getAssignmentData(run_request.assignment_id,con);
		submission_info = await getSubmissionData(run_request.submission_id,con);

		con.release();

		let found_assignment = typeof assignment_info !== 'undefined';
		let found_submission = typeof submission_info !== 'undefined';

		if(!found_assignment || !found_submission) {

			let msg = 'did not find ';
			if(!found_assignment && !found_submission)
				msg += 'assignment or submission';
			else if(!found_assignment)
				msg += 'assignment';
			else
				msg += 'submission';

			await res.endJSON(400,{
				'message': msg
			});

			return;
		}

		await res.endJSON(202,{
			'message': 'running'
		});
	} catch(err) {
		if(con)
			con.release();

		await res.endError(err);

		return;
	}

	log.info('assignment',assignment_info);
	log.info('submission',submission_info);

	log.info('creating container');

	try {
		let result = await containers.create(null,{});
	} catch(err) {
		log.error(err.stack);
	}
});