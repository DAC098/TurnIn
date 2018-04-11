const Worker = require('./lib/Worker');

const wkr = new Worker();

wkr.location = {
	secure: false,
	host: 'worker',
	port: '443'
};

module.exports = wkr;