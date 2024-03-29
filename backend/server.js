require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const api = require('./routes.js');
const database = require('./database');
const express = require('express');
const session = require('express-session');
const app = express();

const { Server } = require('socket.io');
const { createServer } = require('http');
const httpServer = createServer(app);
const io = new Server(httpServer);

let RedisStore = require('connect-redis')(session);
const { createClient } = require('redis');
let redisClient = createClient({ legacyMode: true });
redisClient.connect();

redisClient.on('connect', () => {
	console.log('Redis connected');
});
redisClient.on('error', (err) => {
	console.log(err);
});

require('./socketIo')(io, database);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let minute = 1000 * 60;

database.runDb().then(() => {
	app.use(
		session({
			store: new RedisStore({ client: redisClient }),
			secret: 'jjong',
			resave: false,
			genid: () => {
				return uuidv4(); // use UUIDs for session IDs
			},
			cookie: {
				httpOnly: true,
				maxAge: minute * 60,
			},
			saveUninitialized: false,
		})
	);
	app.use('/api', api);

	httpServer.listen(process.env.PORT, () => {
		console.log(`Connected to port ${process.env.PORT}`);
	});
});
