const checkAuthentication = require('modules/security/middleware/checkAuthorization');

module.exports = [
	[
		{
			path: '/',
			type: 'mdlwr',
			methods: ['get','post','put','delete'],
			options: {
				end: false
			}
		},
		checkAuthentication
	]
];