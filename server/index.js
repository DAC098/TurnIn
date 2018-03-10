const process = require('process');

const log = require('modules/log');
const setup = require('modules/setup');
const configure = require('modules/setup/configure');

(async () => {
	log.setName('server');

	log.info('loading /etc/turnin');
	await setup.loadEtc();

	log.info('processing cli arguments');
	await setup.processCliArgs();

	log.info('config:',setup.get());

	log.info('running configure');
	await configure.run();

	log.info('starting server');
	const server = require('./main');

	if(process.env.NODE_ENV === 'development') {
		require('./dev');
	}
})();
