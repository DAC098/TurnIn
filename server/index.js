const setup = require('modules/setup');
const log = require('modules/log');
(async () => {
	log.setName('server');

	const server = require('./main');
})();
