const process = require('process');

const log = require('modules/log');
const setup = require('modules/setup');
const configure = require('modules/setup/configure');

(async () => {
	log.setName('socket');

	log.info('loading /etc/turnin');
	await setup.loadEtc();

	log.info('processing cli arguments');
	await setup.processCliArgs();

	log.info('running configure');
	await configure.run();

	log.info('starting server');
	let socket = require('./main');

	if(process.env.NODE_ENV === 'development') {
		require('./dev');
	}
})();
