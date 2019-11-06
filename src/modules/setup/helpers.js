const n_path = require('path');

const setup = require('./index');

/**
 *
 * @param id {number|string}
 * @returns {string}
 */
const getSubmissionDir = (id) => {
	return n_path.join(
		setup.getKey('directories.data_root'),
		'submissions',
		`${id}`
	)
};

exports.getSubmissionDir = getSubmissionDir;

/**
 *
 * @param id {string|number}
 * @returns {string}
 */
const getAssignmentDir = (id) => {
	return n_path.join(
		setup.getKey('directories.data_root'),
		'assignments',
		`${id}`
	);
};

exports.getAssignmentDir = getAssignmentDir;

/**
 *
 * @param id {string|number}
 * @returns {string}
 */
const getImageDir = id => {
	return n_path.join(
		setup.getKey('directories.data_root'),
		'images',
		`${id}`
	);
};

exports.getImageDir = getImageDir;