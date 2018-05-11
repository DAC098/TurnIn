const process = require('process');

const log = require('modules/log');
const startup = require('modules/startup');

process.on('exit',code => {
	log.warn('process exiting',{code});
});

process.on('uncaughtException',err => {
	log.error(err.stack);
	process.exit();
});

(async () => {
	log.setName('server');

	await startup();

	const server = require('./main');
	const wkr = require('modules/worker');

	const loadRoutes = require('./load_routes');

	process.on('beforeExit',async () => {
		await wkr.close();
	});

	log.info('loading routes');
	loadRoutes();

	try {
		log.info('creating server');
		server.create();

		log.info('opening server for connections');
		await server.listen(443,'0.0.0.0');

		log.info('server listening',server.instance.address());
	} catch(err) {
		log.error(err.stack);
		return;
	}

	if(process.env.NODE_ENV === 'development') {
		require('./dev');

		log.info('loading test data for database');
		let runTestData = require('../psql/test_data');

		await runTestData();
	}
})();
