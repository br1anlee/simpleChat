const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DBUSER}:${process.env.DBPW}@cluster0.tc23e.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverApi: ServerApiVersion.v1,
});

let users;
let posts;

const addFollower = async (user, follower) => {
	console.log(user, follower);
	const update = { $addToSet: { followers: follower } };
	const result = users.findOneAndUpdate({ username: user }, update);
	const update2 = { $addToSet: { following: user } };
	const result2 = users.findOneAndUpdate({ username: follower }, update2);

	const prom = await Promise.all([result, result2]);
	console.log(prom);

	return prom;
};

const createAccount = async (user) => {
	let result = await users.findOne({ username: user.username });
	if (result) return result;
	const hash = await bcrypt.hash(user.password, saltRounds);
	result = users.insertOne({
		username: user.username,
		password: hash,
		inception: Date(),
		followers: [],
		following: [],
		profilePhoto: '',
	});
	return result;
};

const createPost = async (user, filePath, caption = '') => {
	console.log(user);
	console.log(filePath);
	console.log(caption);
	const post = await posts.insertOne({
		owner: user,
		photo: filePath,
		inception: Date(),
		caption,
		likes: 0,
		comments: [],
	});
	return post;
};

const editProfilePhoto = async (user, filePath = '') => {
	const update = {
		$set: { profilePhoto: filePath },
	};
	const result = await users.updateOne({ username: user }, update);
	return result;
};
const getAllPosts = async () => {
	const result = await posts.find({}).sort({ inception: -1 });
	const cursor = await result.toArray();
	return cursor;
};

const getAllUsers = async () => {
	const projection = { username: 1 };
	const result = await users.find({}).project(projection);

	const cursor = await result.toArray();
	console.log(cursor);
	return cursor;
};
const getUserData = async (user) => {
	const result = await users.findOne({ username: user });
	return result;
};

const getUserPosts = async (user) => {
	const result = await posts.find({ owner: user });
	const cursor = await result.toArray();

	return cursor;
};
const logIn = async (user) => {
	let result = await users.findOne({ username: user.username });
	if (!result) return result;
	const match = await bcrypt.compare(user.password, result.password);
	if (!match) return match;
	const access_token = jwt.sign(user.username, process.env.ACCESS_SECRET);
	return access_token;
};
const runDb = async () => {
	try {
		await client.connect();
		let db = await client.db('simpleChat');
		users = db.collection('users');
		posts = db.collection('posts');
		console.log('connected to db');
	} catch (error) {
		console.log(error);
	}
};

module.exports = {
	addFollower,
	createAccount,
	createPost,
	editProfilePhoto,
	getAllPosts,
	getAllUsers,
	getUserData,
	getUserPosts,
	logIn,
	runDb,
};
