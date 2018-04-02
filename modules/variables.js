/**
 *
 * @typedef {{
 *     images: {
 *         create: boolean,
 *         modify: boolean,
 *         delete: boolean,
 *         network: boolean
 *     },
 *     containers: {
 *         create: boolean,
 *         modify: boolean,
 *         delete: boolean,
 *         network: boolean
 *     },
 *     networking: {
 *         exposing: boolean,
 *         mapping: boolean
 *     }
 * }}
 */
const default_permissions = {
	'images'    : {
		'create' : false,
		'modify' : false,
		'delete' : false,
		'network': false
	},
	'containers': {
		'create' : false,
		'modify' : false,
		'delete' : false,
		'network': false
	},
	'networking': {
		'exposing': false,
		'mapping' : false
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
	'admin' : 1,
	'user'  : 2
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
	'hub'   : 1,
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
	'error'  : 3
};

exports.image_statuses = image_statuses;

/**
 *
 * @typedef {{
 *     extract: string[],
 *     submission_mount: string,
 *     build_commands: string|string[],
 *     test_commands: string[],
 * }}
 */
const default_image_options = {
	extract: [],
	submission_mount: '/app',
	build_commands: [],
	test_commands: []
};

exports.default_image_options = default_image_options;

const user_default_permissions = {
	'admin': {},
	'user' : {}
};

exports.user_default_permissions = user_default_permissions;