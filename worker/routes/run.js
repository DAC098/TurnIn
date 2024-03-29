const n_path = require('path');

const tar = require('tar');

const setup = require('modules/setup');
const db = require('modules/psql');
const log = require('modules/log');

const containers = require('modules/docker/containers');
const exec = require('modules/docker/exec');
const parser = require('modules/parser');
const isJsonContent = require('modules/middleware/isJsonContent');
const Dir = require('modules/fs/Dir');
const File = require('modules/fs/File');

const getAssignmentData = require('modules/psql/helpers/getAssignmentData');
const getSubmissionData = require('modules/psql/helpers/getSubmissionData');

const router = require('../router');
const testing = require('../run_tests');

const route_info = {
	path: '/run',
	methods: 'post'
};

let in_progress = new Set();

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
	let check = req.url_parsed.searchParams.has('check');

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

		if(in_progress.has(submission_info.id)) {
			await res.endJSON(202,{
				'message': 'in-progress'
			});
			return;
		} else {
			if(!check)
				in_progress.add(submission_info.id);

			await res.endJSON(202,{
				'message': check ? 'not-started' : 'started'
			});
		}
	} catch(err) {
		if(con)
			con.release();

		await res.endError(err);

		return;
	}

	if(check)
		return;

	if(submission_info.image.type !== 'hub') {
		log.warn('image is not on the hub');
	}

	let run_container = null;
	let mount_files = false;
	let mount_dir = '';
	let submission_dir = setup.helpers.getSubmissionDir(submission_info.id);
	let results_dir = n_path.join(
		submission_dir,
		'results'
	);
	let extracts_dir = n_path.join(
		submission_dir,
		'extracts'
	);

	await Dir.make(results_dir);
	await Dir.make(extracts_dir);

	if(submission_info.files.length > 0) {
		mount_files = true;

		mount_dir = n_path.join(
			submission_dir,
			'__mount'
		);
	}

	if(mount_files) {
		try {
			log.info('cleaning mount',{
				submission: submission_info.id
			});

			if(await Dir.exists(mount_dir))
				await Dir.remove(mount_dir,true);

			await Dir.make(mount_dir);
		} catch(err) {
			log.error(`cleaning mount: ${err.stack}`,{
				submission: submission_info.id
			});

			mount_files = false;
		}
	}

	if(mount_files) {
		try {
			log.info('mounting submission files',{
				submission: submission_info.id
			});

			for(let file of submission_info.files) {
				if(n_path.extname(file.name) === '.tar') {
					await tar.extract({
						cwd: mount_dir,
						file: n_path.join(submission_dir,file.name)
					});
				} else {
					await File.copy(
						n_path.join(submission_dir,file.name),
						n_path.join(mount_dir,file.name)
					);
				}
			}
		} catch(err) {
			log.error(`mounting submission files: ${err.stack}`,{
				submission: submission_info.id
			});

			mount_files = false;
		}
	}

	log.info('creating container',{
		submission: submission_info.id
	});

	try {
		let container_options = {
			Image: submission_info.image.type === 'custom' ?
				submission_info.image.docker_id :
				submission_info.image.name,
			Cmd: ['/bin/bash'],
			WorkingDir: '/app',
			Tty: false,
			AttachStdin: true,
			AttachStdout: true,
			AttachStderr: true,
			OpenStdin: true
		};

		if(mount_files) {
			container_options['HostConfig'] = {
				Mounts: [
					{
						Target: '/app',
						Source: n_path.join(
							setup.getKey('docker.host_mount'),
							'submissions',
							`${submission_info.id}`,
							'__mount'
						),
						Type: 'bind'
					}
				]
			}
		}

		let result = await containers.create(null,container_options);

		if(result.success) {
			run_container = result.returned
		} else {
			in_progress.delete(submission_info.id);

			log.warn('unable create container, ending process',{
				submission: submission_info.id,
				data: result.returned
			});
			return;
		}
	} catch(err) {
		log.error(`creating container: ${err.stack}`,{
			submission: submission_info.id
		});
	}

	log.info('starting container',{
		submission: submission_info.id,
		container: run_container.Id
	});

	try {
		let result = await containers.start(run_container.Id);

		if(!result.success) {
			log.warn('failed to start container',{
				submission: submission_info.id,
				container: run_container.Id
			});

			try {
				let result = await containers.remove(run_container.Id);

				if(!result.success) {
					log.warn('failed to remove container',{
						submission: submission_info.id,
						container: run_container.Id
					});
				}
			} catch(err) {
				log.error(`removing container: ${err.stack}`,{
					submission: submission_info.id,
					container: run_container.Id
				});
			}

			in_progress.delete(submission_info.id);

			return;
		}
	} catch(err) {
		log.error(`starting container: ${err.stack}`,{
			submission: submission_info.id,
			container: run_container.Id
		});

		in_progress.delete(submission_info.id);

		return;
	}

	let results_json_path = n_path.join(results_dir,'data.json');
	let results_json = await File.exists(results_json_path) ?
		JSON.parse(await File.read(results_json_path)) :
		{runs:[]};

	log.info('running executions',{
		submission: submission_info.id,
		container: run_container.Id
	});

	let output_files = [];

	for(let cmd of assignment_info.options.exec) {
		let exec_instance = null;

		try {
			let result = await exec.make(run_container.Id,{
				AttachStdout: true,
				AttachStderr: true,
				Cmd: ['/bin/sh','-c',cmd]
			});

			if(result.success) {
				exec_instance = result.returned
			} else {
				log.warn('failed to create exec instance',{
					submission: submission_info.id,
					container: run_container.Id,
					cmd,
					data: result.returned
				});
				continue;
			}
		} catch(err) {
			log.error(`creating command: ${err.stack}`,{
				submission: submission_info.id,
				container: run_container.Id,
				cmd
			});

			output_files.push({
				cmd,
				error: err.stack
			});

			continue;
		}

		try {
			let result = await exec.start(exec_instance.Id);

			if(result.success) {
				output_files.push({
					output: result.returned,
					cmd
				});
			} else {
				output_files.push({
					cmd,
					returned: result.returned
				});
				log.warn('there was a problem running the command',{
					submission: submission_info.id,
					container: run_container.Id,
					cmd,
					data: result.returned
				});
			}
		} catch(err) {
			log.error(`running command: ${err.stack}`,{
				submission: submission_info.id,
				container: run_container.Id,
				cmd
			});

			output_files.push({
				cmd,
				error: err.stack
			});
		}
	}

	results_json.runs.push({
		container: run_container,
		results: output_files
	});

	await File.write(results_json_path,JSON.stringify(results_json));

	log.info('stopping container',{
		submission: submission_info.id,
		container: run_container.Id
	});

	try {
		let result = await containers.stop(run_container.Id);

		if(!result.success) {
			log.warn('failed to stop container',{
				submission: submission_info.id,
				container: run_container.Id
			});
		}
	} catch(err) {
		log.error(`stopping container: ${err.stack}`,{
			submission: submission_info.id,
			container: run_container.Id
		});
	}

	let extract_json_path = n_path.join(extracts_dir,'data.json');
	let extract_json = await File.exists(extract_json_path) ?
		JSON.parse(await File.read(extract_json_path)) :
		{runs:[]};

	if(assignment_info.options.extract.length !== 0) {
		log.info('extracting data',{
			submission: submission_info.id,
			container: run_container.Id
		});

		let count = 0;
		let extract_files = [];

		for(let path of assignment_info.options.extract) {
			try {
				let extract_name = `${run_container.Id}_${++count}.tar`;
				let extract_path = n_path.join(extracts_dir,extract_name);
				let result = await containers.archive.toPath(run_container.Id,path,extract_path);

				if(result.success) {
					extract_files.push({
						path,
						filename: extract_name
					});
				} else {
					log.warn('failed to extract data from container',{
						submission: submission_info.id,
						container: run_container.Id,
						path,
						data: result.returned
					});

					extract_files.push({
						path,
						returned: result.returned
					});
				}
			} catch(err) {
				log.error(`extract data: ${err.stack}`,{
					submission: submission_info.id,
					container: run_container.Id,
					path
				});

				extract_files.push({
					path,
					error: err.stack
				});
			}
		}

		extract_json.runs.push({
			container: run_container,
			results: extract_files
		});
	} else {
		extract_json.runs.push({
			container: run_container,
			results: []
		});
	}

	await File.write(extract_json_path,JSON.stringify(extract_json));

	log.info('removing container',{
		submission: submission_info.id,
		container: run_container.Id
	});

	try {
		let result = await containers.remove(run_container.Id);

		if(!result.success) {
			log.warn('failed to remove container',{
				submission: submission_info.id,
				container: run_container.Id
			});
		}
	} catch(err) {
		log.error(`remove container: ${err.stack}`,{
			submission: submission_info.id,
			container: run_container.Id
		});
	}

	let tests_json_path = n_path.join(results_dir,'tests.json');
	let tests_json = await File.exists(tests_json_path) ?
		JSON.parse(await File.read(tests_json_path)) :
		{runs:[]};

	try {
		log.info('attempting to run vm');

		const sandbox = testing.getContext(assignment_info,submission_info);
		const code = await testing.getTestFile(assignment_info);

		if(code !== null) {
			let value = await testing.runVM(sandbox,code);

			tests_json.runs.push({
				ran: true,
				results: value
			});
		} else {
			tests_json.runs.push({
				ran: false,
				results: null
			});
		}
	} catch(err) {
		log.error(`running test vm: ${err.stack}`,{
			submission: submission_info.id,
			assignment: assignment_info.id
		});
		tests_json.runs.push({
			ran: false,
			error: err.message
		});
	}

	await File.write(tests_json_path,JSON.stringify(tests_json));

	try {
		if(mount_files) {
			log.info('cleaning mount',{
				submission: submission_info.id
			});

			await Dir.remove(mount_dir,true);
		}
	} catch(err) {
		log.error(`cleaning mount: ${err.stack}`,{
			submission: submission_info.id
		});
	}

	in_progress.delete(submission_info.id);

	log.info('run complete');
});