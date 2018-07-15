/*
session controller.
*/

/** server config file. */
const config = require('../../server.json');

/** http://mongoosejs.com/
  mongoose provides a straight-forward, schema-based solution to model your application data.
  it includes built-in type casting, validation, query building, business logic hooks and more,
  out of the box.
*/
const mongoose = require('mongoose').set('debug', config.DEBUG_MONGOOSE);

/** session model. */
const Session = require('../../model/session/session.model');

/** metric-group model. */
const MetricGroup = require('../../model/metric-group/metric-group.model');

/** metric model. */
const Metric = require('../../model/metric/metric.model');

/** custom-made logger module. */
const logger = require('../../util/logger');

/**
 * fetches sessions from db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.headers.filter - filter object. if not provided, fetches all sessions in db.
 *
 * req.headers.fields - specifies which fields should be included in returned session.
 * @param {*} res http response. expected to return sessions as JSON object array.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.getMany = async (req, res, next) => {
	const operationName = 'session.controller.js:getMany';
	logger.verbose('API', operationName, `req.headers${JSON.stringify(req.headers)}`);

	let query;
	if (req.headers.filter) {
		query = Session.find(JSON.parse(req.headers.filter));
	} else {
		query = Session.find();
	}

	if (req.headers.fields) {
		query.select(req.headers.fields);
	}

	if (req.headers.populate) {
		JSON.parse(req.headers.populate).forEach(pathObj => {
			console.log(pathObj);

			query.populate({
				path: pathObj.path,
				select: pathObj.fields
			});
		});
	}

	try {
		const sessions = await query.exec();
		logger.info('API', operationName, `fetched ${sessions.length} sessions`);
		logger.verbose('API', operationName, `${sessions.length} sessions: ${JSON.stringify(sessions)} fetched`, req.user);
		res.status(200).json(sessions);
	} catch (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}
};

/**
 * fetches a session from db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.headers.fields - specifies which fields should be included in returned session.
 * @param {*} res http response. expected to return the session as JSON object.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.getOne = async (req, res, next) => {
	const operationName = 'session.controller.js:getOne';
	const query = Session.findById(req.params.id);

	if (req.headers.fields) {
		query.select(req.headers.fields);
	}

	try {
		const session = await query.exec();

		if (!session) {
			const err = `session ${req.params.id} not found`;
			logger.warn('API', operationName, err, req.user._id);
			logger.verbose('API', operationName, err, req.user);
			res.status(404).send(err);
		} else {
			logger.info('API', operationName, `session ${req.params.id} fetched`, req.user._id);
			logger.verbose('API', operationName, `session ${session} fetched`, req.user);
			res.status(200).json(session);
		}
	} catch (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}
};

/**
 * inserts new sessions to db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.body = array of session objects for insertion.
 *
 * @param {*} res http response. expected to return successfully inserted sessions as
 * an array of JSON objects.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.insertMany = async (req, res, next) => {
	const operationName = 'session.controller:insertMany';
	let err;

	if (!req.body || !req.body.length) {
		err = new Error('invalid input: no resources');
	}

	if (err) {
		logger.error('API', operationName, err, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}

	let sessions, result1, result2;
	result1 = { nModified: 0 };
	result2 = { nModified: 0 };

	const userObj = {
		_id: mongoose.Types.ObjectId(req.user._id),
		username: req.user.username
	};

	const insertObjs = req.body;
	insertObjs.forEach(obj => {
		obj.createdBy = userObj;
		obj.updatedBy = userObj;
	});

	try {
		sessions = await Session.insertMany(insertObjs);
	} catch (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}

	try {
		result1 = addToMetricGroups(sessions.map(session => session.groups), req.user);
		result2 = addToMetrics(sessions.map(session => session.groups.map(group => group.metrics)), req.user);
	} catch (err) {
		logger.error('API', operationName, `${sessions.length} sessions inserted with errors: ${err.message},`, req.user._id);
		logger.verbose('API', operationName, `${sessions.length} sessions ${JSON.stringify(sessions)} inserted with errors: ${err},`, req.user);
		return next(err);
	}

	logger.info('API', operationName, `${sessions.length} sessions inserted`, req.user._id);
	logger.verbose('API', operationName, `${sessions.length} sessions ${JSON.stringify(sessions)} inserted`, req.user);
	res.status(200).json([sessions, await result1, await result2]);
};

/**
 * inserts a new session to db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.body = session object for insertion.
 *
 * @param {*} res http response. expected to return successfully inserted session as
 * a JSON object.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.insertOne = async (req, res, next) => {
	const operationName = 'session.controller:insertOne';
	let err;

	if (!req.body) {
		err = new Error('invalid input: no resources');
		err.status(403);
	}

	if (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}

	let session, result1, result2;
	result1 = { nModified: 0 };
	result2 = { nModified: 0 };

	const userObj = {
		_id: mongoose.Types.ObjectId(req.user._id),
		username: req.user.username
	};

	const insertObj = req.body;
	insertObj.createdBy = userObj;
	insertObj.updatedBy = userObj;

	try {
		session = await Session.create(insertObj);
	} catch (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}

	try {
		result1 = addToMetricGroups(session.groups, req.user);
		result2 = addToMetrics(session.groups.map(group => group.metrics), req.user);
	} catch (err) {
		logger.error('API', operationName, `session ${session._id} inserted with errors: ${err.message},`, req.user._id);
		logger.verbose('API', operationName, `session ${JSON.stringify(session)} inserted with errors: ${err},`, req.user);
		return next(err);
	}

	logger.info('API', operationName, `session ${session._id} inserted`, req.user._id);
	logger.verbose('API', operationName, `session ${JSON.stringify(session)} inserted`, req.user);
	res.status(200).json([session, await result1, await result2]);
};

/**
 * updates sessions in db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.body = object with key : nuValue pairs,
 * also includes _id field for finding.
 *
 * @param {*} res http response. expected to return successfully updated sessions as
 * a JSON object.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.updateMany = async (req, res, next) => {
	const operationName = 'session.controller:updateMany';
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

	let result1, result2, result3;
	result2 = { nModified: 0 };
	result3 = { nModified: 0 };

	try {
		result1 = await Session.bulkWrite(ops);
	} catch (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}

	try {
		result2 = updateMetricGroups(
			req.body.map(elem => elem.groups),
			req.body.map(elem => elem.removedGroups),
			req.user
		);
		result3 = updateMetrics(
			req.body.map(elem => elem.groups.map(group => group.metrics)),
			req.body.map(elem => elem.removedMetrics),
			req.user
		);
	} catch (err) {
		logger.error('API', operationName, `${result1.nModified} sessions updated with errors: ${err.message},`, req.user._id);
		logger.verbose('API', operationName, `${result1.nModified} sessions ${JSON.stringify(ops)} updated with errors: ${err},`, req.user);
		return next(err);
	}

	logger.info('API', operationName, `${result1.nModified} sessions updated`, req.user._id);
	logger.verbose('API', operationName, `${result1.nModified} sessions ${JSON.stringify(ops)} updated`, req.user);
	res.status(200).json([result1, await result2, await result3]);
};


/**
 * updates a session in db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.body = object with key : nuValue pairs,
 * and also (optional) removedMetrics property with metrics id's array.
 *
 * @param {*} res http response. expected to return successfully updated session as
 * a JSON object.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.updateOne = async (req, res, next) => {
	const operationName = 'session.controller:updateOne';
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

	let session, result1, result2;
	result1 = { nModified: 0 };
	result2 = { nModified: 0 };

	try {
		session = await Session.findByIdAndUpdate(
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

	if (req.body.groups || req.body.removedGroups) {
		try {
			result1 = updateMetricGroups(
				req.body.groups,
				req.body.removedGroups,
				req.user
			);
			result2 = updateMetrics(
				req.body.groups.map(group => group.metrics),
				req.body.removedMetrics,
				req.user
			);
		} catch (err) {
			logger.error('API', operationName, `session ${req.params.id} updated with errors: ${err.message},`, req.user._id);
			logger.verbose('API', operationName, `session ${JSON.stringify(session)} updated with errors: ${err},`, req.user);
			return next(err);
		}
	}

	logger.info('API', operationName, `session ${req.params.id} updated`, req.user._id);
	logger.verbose('API', operationName, `session ${session} updated`, req.user);
	res.status(200).json([session, await result1, await result2]);
};

/**
 * deletes sessions from db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.body = array of objects: { _id: String, groups: [string], metrics: [String] }
 *
 * @param {*} res http response.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.deleteMany = async (req, res, next) => {
	const operationName = 'session.controller:deleteOne';
	let err = null;

	if (!req.body || !req.body.length) {
		err = new Error('invalid input: no resources');
	}

	if (err) {
		logger.error('API', operationName, err, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}

	let result1, result2, result3;
	result2 = { nModified: 0 };
	result3 = { nModified: 0 };

	try {
		result1 = await Session.deleteMany({
			_id: {
				$in: req.body.map(elem => elem._id)
			}
		});
	} catch (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}

	try {
		result2 = removeFromMetricGroups(req.body.map(elem => elem.groups), req.user);
		result3 = removeFromMetrics(req.body.map(elem => elem.metrics), req.user);
	} catch (err) {
		logger.error('API', operationName, `${req.body.length} sessions deleted with errors: ${err.message},`, req.user._id);
		logger.verbose('API', operationName, `${req.body.length} sessions ${JSON.stringify(req.body)} deleted with errors: ${err},`, req.user);
		return next(err);
	}

	logger.info('API', operationName, `${req.body.length} sessions deleted`, req.user._id);
	logger.verbose('API', operationName, `${req.body.length} sessions ${JSON.stringify(req.body)} deleted`, req.user);
	res.status(200).json([result1, await result2, await result3]);
};

/**
 * deletes a session from db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.body.groups - array of metric-groups ids to remove session from.
 *
 * @param {*} res http response. expected to return a result object.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.deleteOne = async (req, res, next) => {
	const operationName = 'session.controller:deleteOne';

	let result1, result2, result3;
	result2 = { nModified: 0 };
	result3 = { nModified: 0 };

	try {
		result1 = await Session.deleteOne({
			_id: req.params.id
		});
	} catch (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}

	try {
		result2 = removeFromMetricGroups(req.body.groups, req.user);
		result3 = removeFromMetrics(req.body.metrics, req.user);
	} catch (err) {
		logger.error('API', operationName, `session ${req.params.id} deleted with errors: ${err.message},`, req.user._id);
		logger.error('API', operationName, `session ${req.params.id} deleted with errors: ${err},`, req.user);
		return next(err);
	}

	logger.info('API', operationName, `session ${req.params.id} deleted`, req.user._id);
	logger.verbose('API', operationName, `session ${req.params.id} deleted`, req.user);
	res.status(200).json([result1, await result2, await result3]);
};

/**
 * adds session/s to metric-groups.
 * if performing both remove and add, use updateMetricGroups instead!
 * @param {any} addObj object or array of objects: { groups: [string] }.
 * @param {any} user user object.
 * @returns promise.
 */
function addToMetricGroups(addObj, user) {
	return updateMetricGroups(addObj, null, user);
}

/**
 * removes session/s from metric-groups.
 * if performing both remove and add, use updateMetricGroups instead!
 * @param {any} removeObj object or array of objects: { groups: [string] }.
 * @param {any} user user object.
 * @returns promise.
 */
function removeFromMetricGroups(removeObj, user) {
	return updateMetricGroups(null, removeObj, user);
}

/**
 * updates metric-groups' sessions counters.
 * @param {any} addObj object or array of objects: { groups: [string]}.
 * @param {any} removeObj object or array of objects: { groups: [string]}.
 * @param {any} user user object.
 * @returns promise.
 */
function updateMetricGroups(addObj, removeObj, user) {
	// const operationName = 'metric.controller:updateMetricGroups';

	/** used in bulkWrite. */
	const ops = [];

	/** updatedby obj */
	const by = {
		_id: mongoose.Types.ObjectId(user._id),
		username: user.username
	};

	if (addObj) {
		addObj = pivotToGroups(addObj);

		addObj.forEach(element => {
			ops.push({
				updateOne: {
					filter: {
						_id: element.group
					},
					update: {
						$inc: {
							'sessions': element.sessions
						},
						updatedBy: by,
						updatedAt: new Date()
					}
				}
			});
		});
	}

	if (removeObj) {
		removeObj = pivotToGroups(removeObj);

		removeObj.forEach(element => {
			ops.push({
				updateOne: {
					filter: {
						_id: element.group
					},
					update: {
						$inc: {
							'sessions': -element.sessions
						},
						updatedBy: by,
						updatedAt: new Date()
					}
				}
			});
		});
	}

	return new Promise((resolve, reject) => {
		if (ops.length > 0) {
			MetricGroup.bulkWrite(ops, (err, result) => {
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}
			});
		} else {
			resolve({
				nModified: 0
			});
		}
	});
}

function pivotToGroups(groups) {
	if (groups && groups.length) {
		let counters = {};
		if (Array.isArray(groups[0])) {
			groups.forEach(grpArr => {
				grpArr.forEach(grp => {
					const id = grp._id ? grp._id : grp;
					if (counters[id]) {
						counters[id]++;
					} else {
						counters[id] = 1;
					}
				});
			});
		} else {
			groups.forEach(grp => {
				const id = grp._id ? grp._id : grp;
				if (counters[id]) {
					counters[id]++;
				} else {
					counters[id] = 1;
				}
			});
		}

		return Object.keys(counters).map(key => {
			return {
				group: key,
				sessions: counters[key]
			};
		});
	}

	return null;
}

/**
 * adds session/s to metrics.
 * if performing both remove and add, use updates instead!
 * @param {any} addObj object or array of objects: { metrics: [string] }.
 * @param {any} user user object.
 * @returns promise.
 */
function addToMetrics(addObj, user) {
	return updateMetrics(addObj, null, user);
}

/**
 * removes session/s from metrics.
 * if performing both remove and add, use updateMetrics instead!
 * @param {any} removeObj object or array of objects: { metrics: [string] }.
 * @param {any} user user object.
 * @returns promise.
 */
function removeFromMetrics(removeObj, user) {
	return updateMetrics(null, removeObj, user);
}

/**
 * updates metrics' sessions counters.
 * @param {any} addObj object or array of objects: { metrics: [string]}.
 * @param {any} removeObj object or array of objects: { metrics: [string]}.
 * @param {any} user user object.
 * @returns promise.
 */
function updateMetrics(addObj, removeObj, user) {
	// const operationName = 'metric.controller:updateMetricGroups';

	/** used in bulkWrite. */
	const ops = [];

	/** updatedby obj */
	const by = {
		_id: mongoose.Types.ObjectId(user._id),
		username: user.username
	};

	if (addObj) {
		addObj = pivotToMetrics(addObj);

		addObj.forEach(element => {
			ops.push({
				updateOne: {
					filter: {
						_id: element.metric
					},
					update: {
						$inc: {
							'sessions': element.sessions
						},
						updatedBy: by,
						updatedAt: new Date()
					}
				}
			});
		});
	}

	if (removeObj) {
		removeObj = pivotToMetrics(removeObj);

		removeObj.forEach(element => {
			ops.push({
				updateOne: {
					filter: {
						_id: element.metric
					},
					update: {
						$inc: {
							'sessions': -element.sessions
						},
						updatedBy: by,
						updatedAt: new Date()
					}
				}
			});
		});
	}

	return new Promise((resolve, reject) => {
		if (ops.length > 0) {
			Metric.bulkWrite(ops, (err, result) => {
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}
			});
		} else {
			resolve({
				nModified: 0
			});
		}
	});
}

function pivotToMetrics(metrics) {
	if (metrics && metrics.length) {
		let counters = {};
		if (Array.isArray(metrics[0])) {
			metrics.forEach(metArr => {
				metArr.forEach(met => {
					const id = met._id || met;
					if (counters[id]) {
						counters[id]++;
					} else {
						counters[id] = 1;
					}
				});
			});
		} else {
			metrics.forEach(met => {
				const id = met._id || met;
				if (counters[id]) {
					counters[id]++;
				} else {
					counters[id] = 1;
				}
			});
		}

		return Object.keys(counters).map(key => {
			return {
				metric: key,
				sessions: counters[key]
			};
		});
	}

	return null;
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
		},
		updatedAt: new Date()
	};

	update = JSON.parse(JSON.stringify(update)); //clone
	delete update._id; // not an actual change.

	Object.keys(update).forEach(key => updateObj[key] = update[key]);

	return updateObj;
}
