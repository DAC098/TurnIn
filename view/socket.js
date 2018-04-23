import io from 'socket.io-client';

const socket = io(window.location.origin,{
	path: '/socket'
});

socket.on('connect',() => {
	console.log('connected to server');
});

socket.on('disconnect',() => {
	console.log('disconnected from server');
});

export default socket;

