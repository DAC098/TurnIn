const db = require('modules/psql');
const log = require('modules/log');

const containers = require('modules/docker/containers');
const exec = require('modules/docker/exec');
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

	if(submission_info.image.type !== 'hub') {
		log.warn('image is not on the hub');
	}

	let run_container = null;

	log.info('creating container');

	try {
		let result = await containers.create(null,{
			Image: submission_info.image.name,
			Cmd: ['/bin/bash'],
			Tty: false,
			AttachStdin: true,
			AttachStdout: true,
			AttachStderr: true,
			OpenStdin: true
		});

		log.info('container result',result);

		if(result.success) {
			run_container = result.returned
		} else {
			log.warn('unable create container, ending process');
			return;
		}
	} catch(err) {
		log.error(err.stack);
	}

	log.info('starting container');

	try {
		let result = await containers.start(run_container.Id);

		log.info('starting result',result);
	} catch(err) {
		log.error(err.stack);
	}

	log.info('running executions');

	for(let cmd of assignment_info.options.exec) {
		log.info(`executing: "/bin/sh -c ${cmd}"`);

		let exec_instance = null;

		log.info('creating execute instance');

		try {
			let result = await exec.make(run_container.Id,{
				AttachStdout: true,
				AttachStderr: true,
				Cmd: ['/bin/sh','-c',cmd]
			});

			log.info('exec create result',result);

			if(result.success) {
				exec_instance = result.returned
			} else {
				log.warn('failed to create exec instance');
				continue;
			}
		} catch(err) {
			log.error(err.stack);
		}

		log.info('executing command');

		try {
			let result = await exec.start(exec_instance.Id);

			log.info('exec start result',result);
		} catch(err) {
			log.error(err.stack);
		}
	}

	log.info('stopping container');

	try {
		let result = await containers.stop(run_container.Id);

		log.info('stopping result',result);
	} catch(err) {
		log.error(err.stack);
	}

	log.info('extracting data');

	log.info('destroying container');

	try {
		let result = await containers.remove(run_container.Id);

		log.info('removal result',result);
	} catch(err) {
		log.error(err.stack);
	}
});