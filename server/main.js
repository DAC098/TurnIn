const http2 = require('http2');
const fs = require('fs');

const setup = require('modules/setup');
const log = require('modules/log');

const handle = require('./handle');

const opts = {
	key: fs.readFileSync(setup.getKey('tls.key')),
	cert: fs.readFileSync(setup.getKey('tls.cert')),
	allowHTTP1: true
};

const server = http2.createSecureServer(opts, handle);

server.on('listening',err => {
	if(err)
		log.error(err.stack);
	else
		log.info('server listening for connections, https://0.0.0.0:443');
});

server.listen(443,'0.0.0.0');

module.exports = server;
