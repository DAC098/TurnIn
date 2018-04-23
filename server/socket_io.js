const SocketIO = require('socket.io');

const log = require('modules/log');

const server = require('./main');

const io = SocketIO(server.instance,{
	path: '/socket'
});

module.exports = io;

io.on('connection',socket => {
	log.info('socket io connection');

	socket.on('disconnect',() => {
		log.info('socket disconnected');
	});
});