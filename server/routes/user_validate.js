const checkAuthentication = require('modules/security/middleware/checkAuthorization');

module.exports = [
	[
		{
			path: '/',
			type: 'mdlwr',
			methods: ['get','post','put','delete'],
			regex: /\//
		},
		checkAuthentication
	]
];