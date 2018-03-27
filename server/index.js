const process = require('process');

const log = require('modules/log');
const setup = require('modules/setup');
const configure = require('modules/setup/configure');

const server = require('./main');
const loadRoutes = require('./load_routes');

process.on('exit',code => {
	log.warn('process exiting',{code});
});

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

	try {
		log.info('checking database connection');

		let connected = await db_init.awaitConnection(3,1000 * 3);

		if(!connected) {
			log.warn('unable to connected to database');
			return;
		} else {
			log.info('connected to database');
		}
	} catch(err) {
		log.error(err.stack);
	}

	log.info('loading routes');
	loadRoutes();

	log.info('running db startup');
	await db_init.startup();

	try {
		log.info('opening server for connections');
		await server.listenAsync(443,'0.0.0.0');

		log.info('server listening for connections',server.address());
	} catch(err) {
		log.error(err.stack);
	}

	if(process.env.NODE_ENV === 'development') {
		require('./dev');

		log.info('loading test data for database');
		await db_init.loadTestData();
	}
})();
