const setup = require('modules/setup');
const log = require('modules/log');

(async () => {
	log.setName('socket');
	let socket = require('./main');
})();