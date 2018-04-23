const log = require('modules/log');

module.exports = [
	[
		{
			path: '/socket',
			methods: 'get',
			options: {
				end: false
			}
		},
		async (req,res) => {
			log.info('socket passthru');
		}
	]
];