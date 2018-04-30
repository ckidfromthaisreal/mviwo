/*
user controller.
*/

/** server config file. */
// const config = require('../../server.json');

/** http://mongoosejs.com/
  mongoose provides a straight-forward, schema-based solution to model your application data.
  it includes built-in type casting, validation, query building, business logic hooks and more,
  out of the box.
*/
// const mongoose = require('mongoose').set('debug', config.DEBUG_MONGOOSE);

/** metric model. */
const User = require('../../model/user/user.model');

/** custom-made logger module. */
const logger = require('../../util/logger');

/**
 * lib to help you hash password.
 */
const bcrypt = require('bcryptjs');

/**
 * register user to application.
 * @param {*} req http request.
 *
 * req.body.username = user's username.
 *
 * req.body.password = user's password.
 *
 * req.body.email = user's email.
 *
 * @param {*} res http response. expected to return a session token.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.register = async (req, res, next) => {
	const operationName = 'user.controller:register';

	if (!req.body.email || !req.body.username || !req.body.password) {
		const err = new Error('invalid request: missing parameters');
		logger.error('API', operationName, err);
		return next(err);
	}

	let user;

	try {
		user = await User.create({
			email: req.body.email,
			username: req.body.username,
			password: req.body.password
		});
	} catch (err) {
		logger.error('API', operationName, err);
		return next(err);
	}

	logger.info('API', operationName, `user ${req.body.username} registered`);

	const token = user.generateJwt();
	res.status(200).json({
		token: token
	});
};

/**
 * logs user into system.
 * @param {*} req http request.
 *
 * req.body.login - username or email.
 *
 * req.body.password - password.
 *
 * @param {*} res http response. expected to return a session token.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.login = async (req, res, next) => {
	const operationName = 'user.controller:login';

	if (!req.body.login || !req.body.password) {
		const err = new Error('invalid request: missing parameters');
		return next(err);
	}

	authenticate(req.body.login, req.body.password, (err, user) => {
		if (err) {
			logger.error('API', operationName, err);
			return next(err);
		}

		logger.info('API', operationName, `user '${req.body.login}' logged in`);
		const token = user.generateJwt();
		res.status(200).json({
			token: token
		});
	});
};

/**
 * deletes a user from db.
 * @param {*} req http request. should contain either _id, username or email.
 * @param {*} res http response. expected to return an object with deletion result.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.delete = async (req, res, next) => {
	const operationName = 'user.controller:delete';

	if (!req.body._id && !req.body.username && !req.body.email) {
		const err = new Error('Invalid request: no resources');
		logger.error(err);
		return next(err);
	}

	let result;

	try {
		result = await User.deleteOne({
			$or: [{
				_id: req.body.id
			},
			{
				username: req.body.username
			},
			{
				email: req.body.email
			}
			]
		});
	} catch (err) {
		logger.error('API', operationName, err);
		return next(err);
	}

	logger.info('API', operationName, `user '${req.body.id || req.body.username || req.body.email}' deleted`);
	res.status(200).json(result);
};

/**
 * authenticates login credentials.
 * compares password to hashed password stored in db.
 * @param {*} login email or username.
 * @param {*} password login password.
 * @param {*} callback (err, user)
 */
async function authenticate(login, password, callback) {
	let user;

	try {
		user = await User.findOne({
			$or: [{
				email: login
			}, {
				username: login
			}]
		}).exec();
	} catch (err) {
		return callback(err);
	}

	if (!user) {
		const err = new Error('user not found');
		err.status = 401;
		return callback(err);
	}

	try {
		const cmp = await bcrypt.compare(password, user.password);
		if (!cmp) {
			const err = new Error('wrong password');
			err.status = 401;
			return callback(err);
		}
	} catch (err) {
		return callback(err);
	}

	callback(null, user);
}
