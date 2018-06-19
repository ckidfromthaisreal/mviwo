/*
custom-made database connection manager module.
*/

/** server config file. */
const config = require('../server.json');

/** custom-made logger module. use logger.log(...) */
const logger = require('../util/logger');

/** http://mongoosejs.com/
  mongoose provides a straight-forward, schema-based solution to model your application data.
  it includes built-in type casting, validation, query building, business logic hooks and more,
  out of the box.
*/
const mongoose = require('mongoose').set('debug', config.DEBUG_MONGOOSE);

/** remote db username */
const username = 'Admin';

/** remote db password */
const password = '!A2s3d4f';

/** remote mongodb link */
const remoteDB = `mongodb://${username}:${password}@` +
	'clusterladak-shard-00-00-05mix.mongodb.net:27017' + ',' +
	'clusterladak-shard-00-01-05mix.mongodb.net:27017' + ',' +
	'clusterladak-shard-00-02-05mix.mongodb.net:27017' + '/' +
	`${config.MONGO_NAME}?ssl=true` + '&' +
	'replicaSet=ClusterLadak-shard-0' + '&' +
	'authSource=admin';

/** local mongodb link used a fallback when remoteDB is inaccessible. */
const localDB = `mongodb://localhost:${config.MONGO_LOCAL_PORT}/${config.MONGO_NAME}`;

/** current database connection link. */
let currentDB;

/* assign promise library. */
mongoose.Promise = global.Promise;

/** connection to database */
const connection = mongoose.connection;

/** connection attempts. */
let attempts = 0;

/* on connection failed: by default, if failed on remote, try to connect to local. */
connection.on('error', () => {
	logger.error('DB', 'db.js:mongoose.connect', `failed connecting to: ${currentDB}`);

	if (!config.CONNECT_TO_LOCAL) {
		if (attempts++ < config.MAXIMUM_ATTEMPTS) {
			mongoose.connect(remoteDB);
		} else if (config.FALLBACK_TO_LOCAL && currentDB !== localDB) {
			mongoose.connect((currentDB = localDB), {
				useMongoClient: true
			});
		}
	}
});

connection.on('disconnected', () => {
	logger.info('DB', 'db.js:mongoose.connect', `disconnected from: ${currentDB}`);
});

/* on successful connection, log a message. */
connection.once('open', () => {
	logger.info('DB', 'db.js:mongoose.connect', `successfully connected to: ${currentDB}`);
	initUsers();
});

/**
 * connect to database.
 */
exports.connect = () => {
	mongoose.connect(currentDB = config.CONNECT_TO_LOCAL ? localDB : remoteDB);
};

/**
 * persistent users initialization.
 */
function initUsers() {
	const User = require('./user/user.model');
	const bcrypt = require('bcryptjs');

	User.updateOne({
		username: 'superuser'
	}, {
		username: 'superuser',
		email: 'mviwo.hq@gmail.com',
		password: bcrypt.hashSync(require('../secret').superpassword || 'superuser123'),
		power: 999
	}, {
		upsert: true
	}).exec();

	User.updateOne({
		username: 'student'
	}, {
		username: 'student',
		email: 'student@mviwo.com',
		password: bcrypt.hashSync('student123'),
		power: 200
	}, {
		upsert: true
	}).exec();
}
