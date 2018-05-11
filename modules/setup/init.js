let initialized = false;

const init = async () => {
	if(initialized)
		return true;

	const setup = require('./index');

	await setup.loadEtc();

	await setup.processCliArgs();

	await setup.checkDirectories();

	initialized = true;

	return true;
};

module.exports = init;