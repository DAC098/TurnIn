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

const user_type_map = {
	'master': 0,
	'admin': 1,
	'user': 2
};

exports.user_type_map = user_type_map;

const user_default_permissions = {
	'admin': {

	},
	'user': {

	}
};

exports.user_default_permissions = user_default_permissions;