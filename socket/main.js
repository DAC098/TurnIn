const https = require('https');
const fs = require('fs');

const SocketIO = require('socket.io');

const setup = require('modules/setup');
const log = require('modules/log');

const opts = {
	key: fs.readFileSync(setup.getKey('tls.key')),
	cert: fs.readFileSync(setup.getKey('tls.cert'))
};

const server = https.createServer(opts);

const socket = new SocketIO(server);

module.exports = socket;

socket.on('connection',async soc => {
	log.info('socket connected',{'socket':soc.id});

	soc.on('disconnect',() => {
		log.info('socket disconnected',{'socket': soc.id});
	});
});

(async () => {
	let listener = new Promise((resolve,reject) => {
		server.listen(443,'0.0.0.0',() => {
			resolve();
		});
	});

	await listener;

	log.info('socket server listening https://0.0.0.0:443');
})();