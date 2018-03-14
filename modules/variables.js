const default_permissions = {
	'create_image': false,
	'modify_image': false,
	'delete_image': false,
};

exports.default_permissions = default_permissions;

const user_type_map = {
	'master': 0,
	'admin': 1,
	'user': 2
};

exports.user_type_map = user_type_map;