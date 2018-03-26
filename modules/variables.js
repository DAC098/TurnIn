/**
 *
 * @typedef {{
 *     create_image: boolean,
 *     modify_image: boolean,
 *     delete_image: boolean,
 *     containers: {
 *         create_custom: boolean,
 *         modify_custom: boolean,
 *         delete_custom: boolean
 *     },
 *     networking: {
 *         exposing: boolean,
 *         mapping: boolean
 *     }
 * }}
 */
const default_permissions = {
	'create_image': false,
	'modify_image': false,
	'delete_image': false,
	'containers': {
		'create_custom': false,
		'modify_custom': false,
		'delete_custom': false
	},
	'networking': {
		'exposing': false,
		'mapping': false,
	}
};

exports.default_permissions = default_permissions;

/**
 *
 * @typedef {{
 *     master: number,
 *     admin: number,
 *     user: number
 * }}
 */
const user_type_map = {
	'master': 0,
	'admin': 1,
	'user': 2
};

exports.user_type_map = user_type_map;

/**
 *
 * @typedef {{
 *     custom: number,
 *     hub: number,
 *     remote: number
 * }}
 */
const image_types = {
	'custom': 0,
	'hub': 1,
	'remote': 2
};

exports.image_types = image_types;

/**
 *
 * @typedef {{
 *     created: number,
 *     running: number,
 *     removed: number,
 *     error: number
 * }}
 */
const image_statuses = {
	'created': 0,
	'running': 1,
	'removed': 2,
	'error': 3
};

exports.image_statuses = image_statuses;

/**
 *
 * @typedef {{extract: Array<string>}}
 */
const default_image_options = {
	extract: []
};

exports.default_image_options = default_image_options;

const user_default_permissions = {
	'admin': {

	},
	'user': {

	}
};

exports.user_default_permissions = user_default_permissions;