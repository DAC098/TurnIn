const setup_init = require('./setup/init');
const db_init = require('./psql/init');

const log = require('./log');

let setup_run = false;

const startup = async () => {
	if(setup_run)
		return true;

	log.info('initializing setup');

	let finished = await setup_init();

	if(!finished)
		return false;

	log.info('initializing db');

	finished = await db_init();

	if(!finished)
		return false;

	setup_run = true;

	return true;
};

module.exports = startup;

