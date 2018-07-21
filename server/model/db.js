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
const username = process.env.DBUSER;

/** remote db password */
const password = process.env.DBPASSWORD;

const shards = process.env.DBSHARDS;

const replica = process.env.DBREPLICA;

/** remote mongodb link */
const remoteDB = `mongodb://${username}:${password}@${shards}/${config.MONGO_NAME}?ssl=true&replicaSet=${replica}&authSource=${username.toLowerCase()}&retryWrites=true`;

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

/* on successful connection, log a message. */
connection.once('open', () => {
	logger.info('DB', 'db.js:mongoose.connect', `successfully connected to: ${currentDB}`);
	try {
		initUsers();
	} catch (err) {
		logger.error('DB', 'db.js:mongoose.connect', 'failed to upsert users!');
	}

	connection.on('connected', () => {
		logger.info('DB', 'db.js:mongoose.connect', `successfully connected to: ${currentDB}`);
	});

	connection.on('disconnected', () => {
		logger.info('DB', 'db.js:mongoose.connect', `disconnected from: ${currentDB}`);
	});

	connection.on('reconnected', () => {
		logger.info('DB', 'db.js:mongoose.connect', `successfully reconnected to: ${currentDB}`);
	});

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
});

/**
 * connect to database.
 */
exports.connect = () => {
	mongoose.connect(currentDB = process.env.NODE_ENV !== 'production' ? localDB : remoteDB)
		.then(() => {
			// server.start();
		}).catch(error => {
			if (error) {
				logger.error('DB', 'db.js:mongoose.connect', error);
				process.exit(1);
			}
		});
};

/**
 * persistent users initialization.
 */
function initUsers() {
	const User = require('./user/user.model');
	const bcrypt = require('bcryptjs');

	User.updateOne({
		username: 'admin'
	}, {
		username: 'admin',
		email: 'admin@mviwo.com',
		// password: bcrypt.hashSync(require('../secret').superpassword),
		password: bcrypt.hashSync(process.env.SUPERPASSWORD),
		power: 999
	}, {
		upsert: true
	}).exec();

	User.updateOne({
		username: 'user'
	}, {
		username: 'user',
		email: 'user@mviwo.com',
		password: bcrypt.hashSync('user123'),
		power: 200
	}, {
		upsert: true
	}).exec();
}
