const variables = require('../variables');

const checkPermission = (user,permission) => {
	if(user.type === 'master') {
		return true;
	}

	if(user.type === 'admin') {

	}
};