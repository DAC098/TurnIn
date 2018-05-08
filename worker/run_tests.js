const n_vm = require('vm');
const n_path = require('path');

const setup = require('modules/setup');
const File = require('modules/fs/File');
const Dir = require('modules/fs/Dir');

const getFileContext = (root_path) => ({
		root: root_path,
		/**
		 *
		 * @param path
		 * @returns {Promise<string>}
		 */
		get: (path) => {
			let file_path = n_path.join(root_path,path);
			return File.read(file_path);
		},
		/**
		 *
		 * @param path
		 * @returns {string}
		 */
		getSync: (path) => {
			let file_path = n_path.join(root_path,path);
			return File.readSync(file_path);
		},
		/**
		 *
		 * @param path
		 * @returns {Promise<*|Promise<*>>}
		 */
		exists: async (path) => {
			let file_path = n_path.join(root_path,path);
			return File.exists(file_path);
		},
		/**
		 *
		 * @param path
		 * @returns {*}
		 */
		existsSync: (path) => {
			let file_path = n_path.join(root_path,path);
			return File.existsSync(file_path);
		}
	});

const getDirContext = (root_path) => ({
	root: root_path,
	/**
	 *
	 * @param path
	 * @param opts
	 * @returns {Promise<found>}
	 */
	get: (path,opts) => {
		let dir_path = n_path.join(root_path,path);
		return Dir.read(dir_path,opts);
	},
	getSync: (path,opts) => {
		let dir_path = n_path.join(root_path,path);
		return Dir.readSync(dir_path,opts);
	},
	exists: (path) => {
		let dir_path = n_path.join(root_path,path);
		return Dir.exists(dir_path);
	},
	existsSync: (path) => {
		let dir_path = n_path.join(root_path,path);
		return Dir.existsSyc(dir_path);
	}
});

const getContext = (assignment_data,submission_data) => {
	const sandbox = {
		nPath: require('path'),
		tar: require('tar'),
		lodash: require('lodash'),
		assignment: {
			...assignment_data,
			File: getFileContext(setup.helpers.getAssignmentDir(assignment_data.id)),
			Dir: getDirContext(setup.helpers.getAssignmentDir(assignment_data.id))
		},
		submission: {
			...submission_data,
			File: getFileContext(setup.helpers.getSubmissionDir(submission_data.id)),
			Dir: getDirContext(setup.helpers.getSubmissionDir(submission_data.id))
		},
		returning: undefined
	};

	n_vm.createContext(sandbox,{
		name: `assignment_${assignment_data.id}_js_test_${Date.now()}`
	});

	return sandbox;
};

exports.getContext = getContext;

const getTestFile = async (assignment_data) => {
	let test_file_path = n_path.join(setup.helpers.getAssignmentDir(assignment_data.id),'tests','main.js');

	if(!await File.exists(test_file_path))
		return null;

	return File.read(test_file_path);
};

exports.getTestFile = getTestFile;

const runVM = async (sandbox,code) => {
	n_vm.runInContext(code,sandbox,{
		displayError: true,
		timeout: 1000 * 10
	});

	return sandbox.returning;
};

exports.runVM = runVM;
