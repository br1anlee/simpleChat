import { io } from 'socket.io-client';

const sio = (userData) => {
	const socket = io();

	socket.on('connect', () => {
		console.log(`Client ${socket.id} connected`);
		socket.auth = { username: userData.username };
	});

	socket.on('userConnected', (data) => {
		console.log(data);
	});

	socket.on('receiveSentMessage', (data) => {
		console.log(data);
	});

	socket.on('connect_error', (err) => {
		console.log(err);
		socket.auth = { username: userData.username };
		socket.connect();
	});
	return socket;
};

export default sio;
