/*
metric-group controller.
*/

/** server config file. */
const config = require('../../server.json');

/** http://mongoosejs.com/
  mongoose provides a straight-forward, schema-based solution to model your application data.
  it includes built-in type casting, validation, query building, business logic hooks and more,
  out of the box.
*/
const mongoose = require('mongoose').set('debug', config.DEBUG_MONGOOSE);

/** metric-group model. */
const MetricGroup = require('../../model/metric-group/metric-group.model');

/** metric model. */
const Metric = require('../../model/metric/metric.model');

/** custom-made logger module. */
const logger = require('../../util/logger');

/**
 * fetches metric-groups from db.
 * @param {*} req http request.
 *
 * req.headers.filter - filter object. if not provided, fetches all metric-groups in db.
 *
 * req.headers.fields - specifies which fields should be included in returned metric.
 *
 * req.headers.metricsPopulate = if true, populates metric-group's metrics array with metric objects.
 *
 * req.headers.metricsSelect = specifies which fields should be included in returned metric objects.
 * @param {*} res http response. expected to return metric-groups as JSON object array.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.getMany = async (req, res, next) => {
	const operationName = 'metric-group.controller.js:getMany';
	logger.verbose('API', operationName, `req.headers${JSON.stringify(req.headers)}`);

	let query;
	if (req.headers.filter) {
		query = MetricGroup.find(JSON.parse(req.headers.filter));
	} else {
		query = MetricGroup.find();
	}

	if (req.headers.fields) {
		query.select(req.headers.fields);
	}

	if (req.headers.metricspopulate === 'true' &&
		(!req.headers.fields || req.headers.fields.includes('metrics'))) {
		query.populate({
			path: 'metrics._id',
			select: req.headers.metricsselect
		});
	}

	try {
		const groups = await query.exec();
		logger.info('API', operationName, `fetched ${groups.length} metric-groups`);
		logger.verbose('API', operationName, `${groups.length} groups: ${JSON.stringify(groups)} fetched`, req.user);
		res.status(200).json(groups);
	} catch (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}
};

/**
 * fetches a metric-group from db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.headers.fields - specifies which fields should be included in returned metric.
 *
 * req.headers.metricspopulate = if true, populates metric-group's metrics array with metric objects.
 *
 * req.headers.metricsselect = specifies which fields should be included in returned metric objects.
 * @param {*} res http response. expected to return the metric-group as JSON object.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.getOne = async (req, res, next) => {
	const operationName = 'metric-group.controller.js:getOne';
	const query = MetricGroup.findById(req.params.id);

	if (req.headers.fields) {
		query.select(req.headers.fields);
	}

	if (req.headers.metricspopulate === 'true' &&
		(!req.headers.fields || req.headers.fields.includes('metrics'))) {
		query.populate({
			path: 'metrics._id',
			select: req.headers.metricsselect
		});
	}

	try {
		const group = await query.exec();

		if (!group) {
			const err = `metric-group ${req.params.id} not found`;
			logger.warn('API', operationName, err, req.user._id);
			logger.verbose('API', operationName, err, req.user);
			res.status(404).send(err);
		} else {
			logger.info('API', operationName, `metric-group ${req.params.id} fetched`, req.user._id);
			logger.verbose('API', operationName, `metric-group ${group} fetched`, req.user);
			res.status(200).json(group);
		}
	} catch (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}
};

/**
 * inserts new metrics to db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.body = array of metric-group objects for insertion.
 *
 * @param {*} res http response. expected to return successfully inserted metric-groups as
 * an array of JSON objects.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.insertMany = async (req, res, next) => {
	const operationName = 'metric-group.controller:insertMany';
	let err;

	if (!req.body || !req.body.length) {
		err = new Error('invalid input: no resources');
	}

	if (err) {
		logger.error('API', operationName, err, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}

	let groups, result;

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
		groups = await MetricGroup.insertMany(insertObjs);
	} catch (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}

	try {
		result = await addToMetrics(groups, req.user);
	} catch (err) {
		logger.error('API', operationName, `${groups.length} metric-groups inserted with errors: ${err.message},`, req.user._id);
		logger.verbose('API', operationName, `${groups.length} metric-groups ${JSON.stringify(groups)} inserted with errors: ${err},`, req.user);
		return next(err);
	}

	logger.info('API', operationName, `${groups.length} metric-groups inserted`, req.user._id);
	logger.verbose('API', operationName, `${groups.length} metric-groups ${JSON.stringify(groups)} inserted`, req.user);
	res.status(200).json([groups, result]);
};

/**
 * inserts a new metric-group to db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.body = metric-group object for insertion.
 *
 * @param {*} res http response. expected to return successfully inserted metric-group as
 * a JSON object.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.insertOne = async (req, res, next) => {
	const operationName = 'metric-group.controller:insertOne';
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

	let group, result;

	const userObj = {
		_id: mongoose.Types.ObjectId(req.user._id),
		username: req.user.username
	};

	const insertObj = req.body;
	insertObj.createdBy = userObj;
	insertObj.updatedBy = userObj;

	try {
		group = await MetricGroup.create(insertObj);
	} catch (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}

	try {
		result = await addToMetrics(group, req.user);
	} catch (err) {
		logger.error('API', operationName, `metric-group ${group._id} inserted with errors: ${err.message},`, req.user._id);
		logger.verbose('API', operationName, `metric-group ${group} inserted with errors: ${err},`, req.user);
		return next(err);
	}

	logger.info('API', operationName, `metric-group ${group._id} inserted`, req.user._id);
	logger.verbose('API', operationName, `metric-group ${group} inserted`, req.user);
	res.status(200).json([group, result]);
};

/**
 * updates metric-groups in db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.body = object with key : nuValue pairs,
 * also includes _id field for finding.
 *
 * @param {*} res http response. expected to return successfully updated groups as
 * a JSON object.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.updateMany = async (req, res, next) => {
	const operationName = 'metric-group.controller:updateMany';
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

	let result1, result2 = {
		nModified: 0
	};

	try {
		result1 = await MetricGroup.bulkWrite(ops);
	} catch (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}

	try {
		result2 = await updateMetrics(
			req.body,
			req.body.map(elem => {
				return {
					_id: elem._id,
					metrics: elem.removedMetrics
				};
			}), req.user);
	} catch (err) {
		logger.error('API', operationName, `${result1.nModified} metric-groups updated with errors: ${err.message},`, req.user._id);
		logger.verbose('API', operationName, `${result1.nModified} metric-groups ${JSON.stringify(ops)} updated with errors: ${err},`, req.user);
		return next(err);
	}

	logger.info('API', operationName, `${result1.nModified} metric-groups updated`, req.user._id);
	logger.verbose('API', operationName, `${result1.nModified} metric-groups ${JSON.stringify(ops)} updated`, req.user);
	res.status(200).json([result1, result2]);
};


/**
 * updates a metric-group in db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.body = object with key : nuValue pairs,
 * and also (optional) removedMetrics property with metrics id's array.
 *
 * @param {*} res http response. expected to return successfully updated metric-group as
 * a JSON object.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.updateOne = async (req, res, next) => {
	const operationName = 'metric.controller:updateOne';
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

	let group, result = {
		nModified: 0
	};

	try {
		group = await MetricGroup.findByIdAndUpdate(
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

	if (group.metrics.length || req.body.removedMetrics) {
		try {
			result = await updateMetrics({
				_id: req.params.id,
				name: group.name,
				description: group.description,
				metrics: group.metrics
			}, {
				_id: req.params.id,
				metrics: req.body.removedMetrics
			}, req.user);
		} catch (err) {
			logger.error('API', operationName, `metric-group ${req.params.id} updated with errors: ${err.message},`, req.user._id);
			logger.verbose('API', operationName, `metric-group ${group} updated with errors: ${err},`, req.user);
			return next(err);
		}
	}

	logger.info('API', operationName, `metric-group ${req.params.id} updated`, req.user._id);
	logger.verbose('API', operationName, `metric-group ${group} updated`, req.user);
	res.status(200).json([group, result]);
};

/**
 * deletes metric-groups from db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.body = array of objects: { _id: String, metrics: [String] }
 *
 * @param {*} res http response.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.deleteMany = async (req, res, next) => {
	const operationName = 'metric-group.controller:deleteOne';
	let err = null;

	if (!req.body || !req.body.length) {
		err = new Error('invalid input: no resources');
	}

	if (err) {
		logger.error('API', operationName, err, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}

	let result1, result2 = {
		nModified: 0
	};

	try {
		result1 = await MetricGroup.deleteMany({
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
		result2 = await removeFromMetrics(req.body, req.user);
	} catch (err) {
		logger.error('API', operationName, `${req.body.length} metric-groups deleted with errors: ${err.message},`, req.user._id);
		logger.verbose('API', operationName, `${req.body.length} metric-groups ${JSON.stringify(req.body)} deleted with errors: ${err},`, req.user);
		return next(err);
	}

	logger.info('API', operationName, `${req.body.length} metric-groups deleted`, req.user._id);
	logger.verbose('API', operationName, `${req.body.length} metric-groups ${JSON.stringify(req.body)} deleted`, req.user);
	res.status(200).json([result1, result2]);
};

/**
 * deletes a metric-group from db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.body.metrics - array of metrics ids to remove metric-group from.
 *
 * @param {*} res http response. expected to return a result object.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.deleteOne = async (req, res, next) => {
	const operationName = 'metric-group.controller:deleteOne';

	let result1, result2 = {
		nModified: 0
	};

	try {
		result1 = await MetricGroup.deleteOne({
			_id: req.params.id
		});
	} catch (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}

	try {
		result2 = await removeFromMetrics({
			_id: req.params.id,
			metrics: req.body.metrics
		}, req.user);
	} catch (err) {
		logger.error('API', operationName, `metric ${req.params.id} deleted with errors: ${err.message},`, req.user._id);
		logger.error('API', operationName, `metric ${req.params.id} deleted with errors: ${err},`, req.user);
		return next(err);
	}

	logger.info('API', operationName, `metric-group ${req.params.id} deleted`, req.user._id);
	logger.verbose('API', operationName, `metric-group ${req.params.id} deleted`, req.user);
	res.status(200).json([result1, result2]);
};

/**
 * adds metric-group/s to metrics.
 * if performing both remove and add, use updateMetrics instead!
 * @param {any} addObj object or array of objects: { group: { _id, name, description }, metrics: [string]}.
 * metric-groups will be added to these metrics.
 * @param {any} user user object.
 * @returns promise.
 */
function addToMetrics(addObj, user) {
	return updateMetrics(addObj, null, user);
}

/**
 * removes metric-group/s from metrics.
 * if performing both remove and add, use updateMetrics instead!
 * @param {any} removeObj object or array of objects: { group: { _id, name, description }, metrics: [string]}.
 * metric/s will be removed from these groups.
 * @param {any} user user object.
 * @returns promise.
 */
function removeFromMetrics(removeObj, user) {
	return updateMetrics(null, removeObj, user);
}

/**
 * updates metrics' metric-groups arrays.
 * @param {any} addObj object or array of objects: { group: { _id, name, description }, metrics: [string]}.
 * metric-group/s will be added to these metrics.
 * @param {any} removeObj object or array of objects: { group: { _id, name, description }, metrics: [string]}.
 * metric-group/s will be removed from these metrics.
 * @param {any} user user object.
 * @returns promise.
 */
function updateMetrics(addObj, removeObj, user) {
	// const operationName = 'metric.controller:updateMetricGroups';

	/** used in bulkWrite. */
	const ops = [];

	const by = {
		_id: mongoose.Types.ObjectId(user._id),
		username: user.username
	};

	if (addObj) {
		addObj = pivotToMetrics(addObj);
		addObj.forEach(element => {
			// update existing groups.
			element.groups.forEach(group => {
				ops.push({
					updateOne: {
						filter: {
							_id: element.metric,
							'groups._id': group._id
						},
						update: {
							$set: {
								'groups.$': {
									_id: group._id,
									name: group.name,
									description: group.description
								}
							}
						}
					}
				});
			});

			// add non existing groups.
			ops.push({
				updateOne: {
					filter: {
						_id: element.metric
					},
					update: {
						$addToSet: {
							groups: {
								$each: element.groups
							}
						},
						updatedBy: by
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
						$pull: {
							groups: {
								'_id': {
									$in: element.groups.map(group => group._id)
								}
							}
						},
						updatedBy: by
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

/**
 * utility function used in updateMetrics(...).
 * turns a group centered object or object array to metric centered array.
 * @param {any} groupsObj group centered object or object array.
 * @returns metric centered object array.
 */
function pivotToMetrics(groupsObj) {
	const metrics = [];
	groupsObj = Array.isArray(groupsObj) ? groupsObj : [groupsObj];

	groupsObj.map(group => {
		return {
			group: {
				_id: mongoose.Types.ObjectId(group._id),
				name: group.name,
				description: group.description,
			},
			metrics: group.metrics || []
		};
	}).forEach(grouping => {
		grouping.metrics.map(metric => mongoose.Types.ObjectId(metric._id || metric)).forEach(metricId => {
			const indexOf = metrics.findIndex(e => e.metric.equals(metricId));
			if (indexOf === -1) {
				metrics.push({
					metric: mongoose.Types.ObjectId(metricId),
					groups: [grouping.group]
				});
			} else {
				metrics[indexOf].groups.push(grouping.group);
			}
		});
	});

	return metrics;
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
	delete update.removedMetrics; // not an actual field.
	delete update._id; // not an actual change.

	Object.keys(update).forEach(key => updateObj[key] = update[key]);

	return updateObj;
}
