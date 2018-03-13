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

	const db_init = require('modules/psql/startup');

	log.info('starting server');
	const server = require('./main');

	log.info('running db startup');
	await db_init.startup();

	if(process.env.NODE_ENV === 'development') {
		require('./dev');
	}
})();
