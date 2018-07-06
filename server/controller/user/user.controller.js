/*
user controller.
*/

/** server config file. */
const config = require('../../server.json');

/** http://mongoosejs.com/
  mongoose provides a straight-forward, schema-based solution to model your application data.
  it includes built-in type casting, validation, query building, business logic hooks and more,
  out of the box.
*/
const mongoose = require('mongoose').set('debug', config.DEBUG_MONGOOSE);

/** metric model. */
const User = require('../../model/user/user.model');

/** custom-made logger module. */
const logger = require('../../util/logger');

/**
 * lib to help you hash password.
 */
const bcrypt = require('bcryptjs');

/**
 * fetches users from db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.headers.filter - filter object. if not provided, fetches all users in db.
 *
 * req.headers.fields - specifies which fields should be included in returned metric.
 *
 * @param {*} res http response. expected to return users as JSON objects.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.getMany = async (req, res, next) => {
	const operationName = 'user.controller:getMany';

	let query;
	if (req.headers.filter) {
		query = User.find(JSON.parse(req.headers.filter));
	} else {
		query = User.find();
	}

	if (req.headers.fields) {
		query.select(req.headers.fields);
	}

	try {
		const users = await query.exec();

		logger.info('API', operationName, `${users.length} users fetched`, req.user._id);
		logger.verbose('API', operationName, `${users.length} users: ${JSON.stringify(users)} fetched`, req.user);
		res.status(200).json(users);
	} catch (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}
};

/**
 * fetches a user from db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.headers.fields - specifies which fields should be included in returned metric.
 *
 * @param {*} res http response. expected to return the user as JSON object.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.getOne = async (req, res, next) => {
	const operationName = 'user.controller:getOne';
	const query = User.findById(req.params.id);

	if (req.headers.fields) {
		query.select(req.headers.fields);
	}

	try {
		const user = await query.exec();

		if (!user) {
			const err = `user ${req.params.id} not found`;
			logger.warn('API', operationName, err, req.user._id);
			logger.verbose('API', operationName, err, req.user);
			res.status(404).send(err);
		} else {
			logger.info('API', operationName, `user ${req.params.id} fetched`, req.user._id);
			logger.verbose('API', operationName, `user ${user} fetched`, req.user);
			res.status(200).json(user);
		}
	} catch (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}
};

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
		logger.error('API', operationName, err.message);
		logger.verbose('API', operationName, err);
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
	logger.verbose('API', operationName, `user ${user} registered`);

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
		logger.error('API', operationName, err.message);
		logger.verbose('API', operationName, err);
		return next(err);
	}

	authenticate(req.body.login, req.body.password, (err, user) => {
		if (err) {
			logger.error('API', operationName, err);
			return next(err);
		}

		logger.info('API', operationName, `user '${req.body.login}' logged in`);
		logger.verbose('API', operationName, `user ${user} logged in`);

		const token = user.generateJwt();
		res.status(200).json({
			token: token
		});
	});
};

/**
 * updates users in db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.body = object with key : nuValue pairs,
 * also includes _id field for finding.
 *
 * @param {*} res http response.
 * a JSON object.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.updateMany = async (req, res, next) => {
	const operationName = 'user.controller:updateMany';
	let err = null;

	if (!req.body || typeof req.body !== 'object' ||
		!Array.isArray(req.body) || !req.body.length) {
		err = new Error('invalid input: no resources');
	}

	if (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}

	const ops = [];

	req.body.forEach(item => {
		ops.push({
			updateOne: {
				filter: {
					_id: item._id
				},
				update: buildUpdateObject(item, req.user)
			}
		});
	});

	let result1;

	try {
		result1 = await User.bulkWrite(ops);
	} catch (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}

	logger.info('API', operationName, `${result1.nModified} users updated`, req.user._id);
	logger.verbose('API', operationName, `${result1.nModified} users ${JSON.stringify(ops)} updated`, req.user);
	res.status(200).json(result1);
};

/**
 * updates a user in db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.body = object with key : nuValue pairs
 *
 * @param {*} res http response.
 * a JSON object.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.updateOne = async (req, res, next) => {
	const operationName = 'user.controller:updateOne';
	let err = null;

	if (!req.body || typeof req.body !== 'object' ||
		!Object.keys(req.body).length) {
		err = new Error('invalid input: no resources');
	}

	if (err) {
		logger.error('API', operationName, err, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}

	let user;

	try {
		user = await User.findByIdAndUpdate(
			req.params.id,
			buildUpdateObject(req.body, req.user), {
				new: true,
				runValidators: true
			}
		);
	} catch (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}

	logger.info('API', operationName, `user ${req.params.id} updated`, req.user._id);
	logger.verbose('API', operationName, `user ${user} updated`, req.user);
	res.status(200).json(user);
};

/**
 * deletes users from db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.body = array of object id's.
 *
 * @param {*} res http response.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.deleteMany = async (req, res, next) => {
	const operationName = 'user.controller:deleteMany';
	let err = null;

	if (!req.body || !req.body.length) {
		err = new Error('invalid input: no resources');
	}

	if (err) {
		logger.error('API', operationName, err, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}

	let result;

	try {
		result = await User.deleteMany({
			_id: {
				$in: req.body.map(elem => elem._id)
			}
		});
	} catch (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}

	logger.info('API', operationName, `${req.body.length} users deleted`, req.user._id);
	logger.verbose('API', operationName, `${req.body.length} users ${JSON.stringify(req.body)} deleted`, req.user);
	res.status(200).json(result);
};

/**
 * deletes a user from db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * @param {*} res http response. expected to return a result object.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.deleteOne = async (req, res, next) => {
	const operationName = 'user.controller:deleteOne';

	let result;

	try {
		result = await User.deleteOne({
			_id: req.params.id
		});
	} catch (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}

	logger.info('API', operationName, `user ${req.params.id} deleted`, req.user._id);
	logger.verbose('API', operationName, `user ${req.params.id} deleted`, req.user);
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

/**
 * builds update object arrays for update queries.
 * @param {*} update object containing key : nuValue pairs.
 * tolerant to _id and removedMetrics fields presence.
 * @param {*} user user object
 * @return update objects array.
 */
function buildUpdateObject(update, user) {
	const updateObj = {
		updatedBy: {
			_id: mongoose.Types.ObjectId(user._id),
			username: user.username
		}
	};

	update = JSON.parse(JSON.stringify(update)); //clone
	delete update._id; // not an actual change.

	Object.keys(update).forEach(key => updateObj[key] = update[key]); // ?

	return updateObj;
}
