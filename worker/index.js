const process = require('process');

const log = require('modules/log');
const setup = require('modules/setup');
const configure = require('modules/setup/configure');

const server = require('./main');

process.on('exit',code => {
	log.warn('process exiting',{code});
});

(async () => {
	log.setName('worker');

	log.info('loading /etc/turnin');
	await setup.loadEtc();

	log.info('processing cli arguments');
	await setup.processCliArgs();

	log.info('config',setup.get());

	log.info('running configure');
	await configure.run();

	const db_init = require('modules/psql/startup');

	try {
		log.info('checking database connection');

		let connected = await db_init.awaitConnection(3,1000 * 3);

		if(!connected) {
			log.warn('unable to connect to database');
			return;
		} else {
			log.info('connected to database');
		}
	} catch(err) {
		log.error(err.stack);
		return;
	}

	try {
		log.info('opening server for connections');
		await server.listen(443,'0.0.0.0');
	} catch(err) {
		log.error(err.stack);
		return;
	}

	if(process.env.NODE_ENV === 'development') {

	}

})();