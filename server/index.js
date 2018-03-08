const process = require('process');

const setup = require('modules/setup');
const log = require('modules/log');

(async () => {
	log.setName('server');

	log.info('processing cli arguments');
	await setup.processCliArgs();

	log.info('starting server');
	const server = require('./main');

	if(process.env.NODE_ENV === 'development') {
		require('./dev');
	}
})();
