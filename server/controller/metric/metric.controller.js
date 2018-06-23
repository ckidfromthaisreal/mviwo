/*
metric controller.
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
const Metric = require('../../model/metric/metric.model');

/** metric-group model. */
const MetricGroup = require('../../model/metric-group/metric-group.model');

/** custom-made logger module. */
const logger = require('../../util/logger');

/**
 * fetches metrics from db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.headers.filter - filter object. if not provided, fetches all metrics in db.
 *
 * req.headers.fields - specifies which fields should be included in returned metric.
 *
 * req.headers.groupsPopulate = if true, populates metric's groups array with metric-group objects.
 *
 * req.headers.groupsSelect = specifies which fields should be included in returned metric-group objects.
 * @param {*} res http response. expected to return the metric as JSON object.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.getMany = async (req, res, next) => {
	const operationName = 'metric.controller:getMany';

	let query;
	if (req.headers.filter) {
		query = Metric.find(JSON.parse(req.headers.filter));
	} else {
		query = Metric.find();
	}

	if (req.headers.fields) {
		query.select(req.headers.fields);
	}

	if (req.headers.groupspopulate === 'true' &&
		(!req.headers.fields || req.headers.fields.includes('groups'))) {
		query.populate({
			path: 'groups._id',
			select: req.headers.groupsselect
		});
	}

	try {
		const metrics = await query.exec();
		logger.info('API', operationName, `${metrics.length} metrics fetched`, req.user._id);
		logger.verbose('API', operationName, `${metrics.length} metrics: ${JSON.stringify(metrics)} fetched`, req.user);
		res.status(200).json(metrics);
	} catch (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}
};

/**
 * fetches a metric from db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.headers.fields - specifies which fields should be included in returned metric.
 *
 * req.headers.groupspopulate = if true, populates metric's groups array with metric-group objects.
 *
 * req.headers.groupsselect = specifies which fields should be included in returned metric-group objects.
 * @param {*} res http response. expected to return the metric as JSON object.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.getOne = async (req, res, next) => {
	const operationName = 'metric.controller:getOne';
	const query = Metric.findById(req.params.id);

	if (req.headers.fields) {
		query.select(req.headers.fields);
	}

	if (req.headers.groupspopulate === 'true' &&
		(!req.headers.fields || req.headers.fields.includes('groups'))) {
		query.populate({
			path: 'groups._id',
			select: req.headers.groupsselect
		});
	}

	try {
		const metric = await query.exec();

		if (!metric) {
			const err = `metric ${req.params.id} not found`;
			logger.warn('API', operationName, err, req.user._id);
			logger.verbose('API', operationName, err, req.user);
			res.status(404).send(err);
		} else {
			logger.info('API', operationName, `metric ${req.params.id} fetched`, req.user._id);
			logger.verbose('API', operationName, `metric ${metric} fetched`, req.user);
			res.status(200).json(metric);
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
 * req.body = array of metric objects for insertion.
 *
 * @param {*} res http response. expected to return successfully inserted metrics as
 * an array of JSON objects.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.insertMany = async (req, res, next) => {
	const operationName = 'metric.controller:insertMany';
	let err;

	if (!req.body || !req.body.length) {
		err = new Error('invalid input: no resources');
	}

	if (err) {
		logger.error('API', operationName, err, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}

	let metrics, result;

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
		metrics = await Metric.insertMany(insertObjs);
	} catch (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}

	try {
		result = await addToMetricGroups(metrics, req.user);
	} catch (err) {
		logger.error('API', operationName, `${metrics.length} metrics inserted with errors: ${err.message},`, req.user._id);
		logger.verbose('API', operationName, `${metrics.length} metrics ${JSON.stringify(metrics)} inserted with errors: ${err},`, req.user);
		return next(err);
	}

	logger.info('API', operationName, `${metrics.length} metrics inserted`, req.user._id);
	logger.verbose('API', operationName, `${metrics.length} metrics ${JSON.stringify(metrics)} inserted`, req.user);
	res.status(200).json([metrics, result]);
};

/**
 * inserts a new metric to db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.body = metric object for insertion.
 *
 * @param {*} res http response. expected to return successfully inserted metric as
 * a JSON object.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.insertOne = async (req, res, next) => {
	const operationName = 'metric.controller:insertOne';
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

	let metric, result;

	const userObj = {
		_id: mongoose.Types.ObjectId(req.user._id),
		username: req.user.username
	};

	const insertObj = req.body;
	insertObj.createdBy = userObj;
	insertObj.updatedBy = userObj;

	try {
		metric = await Metric.create(insertObj);
	} catch (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}

	try {
		result = await addToMetricGroups(metric, req.user);
	} catch (err) {
		logger.error('API', operationName, `metric ${metric._id} inserted with errors: ${err.message},`, req.user._id);
		logger.verbose('API', operationName, `metric ${metric} inserted with errors: ${err},`, req.user);
		return next(err);
	}

	logger.info('API', operationName, `metric ${metric._id} inserted`, req.user._id);
	logger.verbose('API', operationName, `metric ${metric} inserted`, req.user);
	res.status(200).json([metric, result]);
};

/**
 * updates metrics in db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.body = object with key : nuValue pairs,
 * also includes _id field for finding.
 *
 * @param {*} res http response. expected to return successfully inserted metric as
 * a JSON object.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.updateMany = async (req, res, next) => {
	const operationName = 'metric.controller:updateMany';
	let err = null;

	if (!req.body || typeof req.body !== 'object' ||
		!Array.isArray(req.body) || !req.body.length) {
		err = new Error('invalid input: no resources');
	}

	if (err) {
		logger.error('API', operationName, err, req.user);
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
		result1 = await Metric.bulkWrite(ops);
	} catch (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}

	try {
		result2 = await updateMetricGroups(
			req.body,
			req.body.map(elem => {
				return {
					_id: elem._id,
					groups: elem.removedGroups
				};
			}), req.user);
	} catch (err) {
		logger.error('API', operationName, `${result1.nModified} metrics updated with errors: ${err.message},`, req.user._id);
		logger.verbose('API', operationName, `${result1.nModified} metrics ${JSON.stringify(ops)} updated with errors: ${err},`, req.user);
		return next(err);
	}

	logger.info('API', operationName, `${result1.nModified} metrics updated`, req.user._id);
	logger.verbose('API', operationName, `${result1.nModified} metrics ${JSON.stringify(ops)} updated`, req.user);
	res.status(200).json([result1, result2]);
};


/**
 * updates a metric in db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.body = object with key : nuValue pairs,
 * and also (optional) removedGroups property with group id's array.
 *
 * @param {*} res http response. expected to return successfully inserted metric as
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

	let metric, result = {
		nModified: 0
	};

	try {
		metric = await Metric.findByIdAndUpdate(
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
			result = await updateMetricGroups({
				_id: req.params.id,
				groups: req.body.groups
			}, {
				_id: req.params.id,
				groups: req.body.removedGroups
			}, req.user);
		} catch (err) {
			logger.error('API', operationName, `metric ${req.params.id} updated with errors: ${err.message},`, req.user._id);
			logger.verbose('API', operationName, `metric ${metric} updated with errors: ${err},`, req.user);
			return next(err);
		}
	}

	logger.info('API', operationName, `metric ${req.params.id} updated`, req.user._id);
	logger.verbose('API', operationName, `metric ${metric} updated`, req.user);
	res.status(200).json([metric, result]);
};

/**
 * deletes metrics from db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.body = array of objects: { _id: String, groups: [String] }
 *
 * @param {*} res http response.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.deleteMany = async (req, res, next) => {
	const operationName = 'metric.controller:deleteMany';
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
		result1 = await Metric.deleteMany({
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
		result2 = await removeFromMetricGroups(req.body, req.user);
	} catch (err) {
		logger.error('API', operationName, `${req.body.length} metrics deleted with errors: ${err.message},`, req.user._id);
		logger.verbose('API', operationName, `${req.body.length} metrics ${JSON.stringify(req.body)} deleted with errors: ${err},`, req.user);
		return next(err);
	}

	logger.info('API', operationName, `${req.body.length} metrics deleted`, req.user._id);
	logger.verbose('API', operationName, `${req.body.length} metrics ${JSON.stringify(req.body)} deleted`, req.user);
	res.status(200).json([result1, result2]);
};

/**
 * deletes a metric from db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.body.groups - array of metric-groups ids to remove metric from.
 *
 * @param {*} res http response. expected to return a result object.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.deleteOne = async (req, res, next) => {
	const operationName = 'metric.controller:deleteOne';

	let result1, result2 = {
		nModified: 0
	};

	try {
		result1 = await Metric.deleteOne({
			_id: req.params.id
		});
	} catch (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}

	try {
		result2 = await removeFromMetricGroups({
			_id: req.params.id,
			groups: req.body.groups
		}, req.user);
	} catch (err) {
		logger.error('API', operationName, `metric ${req.params.id} deleted with errors: ${err.message},`, req.user._id);
		logger.error('API', operationName, `metric ${req.params.id} deleted with errors: ${err},`, req.user);
		return next(err);
	}

	logger.info('API', operationName, `metric ${req.params.id} deleted`, req.user._id);
	logger.verbose('API', operationName, `metric ${req.params.id} deleted`, req.user);
	res.status(200).json([result1, result2]);
};

/**
 * adds metric/s to metric-groups.
 * if performing both remove and add, use updateMetricGroups instead!
 * @param {any} addObj object or array of objects: { _id: string, groups: [string]}.
 * metric/s will be added to these groups.
 * @param {any} user user object.
 * @returns promise.
 */
function addToMetricGroups(addObj, user) {
	return updateMetricGroups(addObj, null, user);
}

/**
 * removes metric/s from metric-groups.
 * if performing both remove and add, use updateMetricGroups instead!
 * @param {any} removeObj object or array of objects: { _id: string, groups: [string]}.
 * metric/s will be removed from these groups.
 * @param {any} user user object.
 * @returns promise.
 */
function removeFromMetricGroups(removeObj, user) {
	return updateMetricGroups(null, removeObj, user);
}

/**
 * updates metric-groups' metrics arrays.
 * @param {any} addObj object or array of objects: { _id: string, groups: [string]}.
 * metric/s will be added to these groups.
 * @param {any} removeObj object or array of objects: { _id: string, groups: [string]}.
 * metric/s will be removed from these groups.
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
						$addToSet: {
							metrics: {
								$each: element.metrics
							}
						},
						// updatedAt: time,
						updatedBy: by
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
						$pullAll: {
							metrics: element.metrics
						},
						// updatedAt: time,
						updatedBy: by
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

/**
 * utility function used in updateMetricGroups(...).
 * turns a metric centered object or object array to group centered array.
 * @param {any} metricsObj metric centered object or object array.
 * @returns group centered object array.
 */
function pivotToGroups(metricsObj) {
	const groups = [];
	metricsObj = Array.isArray(metricsObj) ? metricsObj : [metricsObj];

	metricsObj.map(metric => {
		return {
			_id: mongoose.Types.ObjectId(metric._id),
			groups: metric.groups || []
		};
	}).forEach(metric => {
		metric.groups.map(group => mongoose.Types.ObjectId(group._id || group)).forEach(groupId => {
			const indexOf = groups.findIndex(e => e.group.equals(groupId));
			if (indexOf === -1) {
				groups.push({
					group: mongoose.Types.ObjectId(groupId),
					metrics: [metric._id]
				});
			} else {
				groups[indexOf].metrics.push(metric._id);
			}
		});
	});

	return groups;
}

/**
 * builds update object arrays for update queries.
 * @param {*} update object containing key : nuValue pairs.
 * tolerant to _id and removedGroups fields presence.
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
	const params = ['number', 'string', 'enum', 'blob', 'date'];

	update = JSON.parse(JSON.stringify(update)); //clone
	delete update.removedGroups; // not an actual field.
	delete update._id; // not an actual change.

	Object.keys(update).forEach(key => {
		if (typeof update[key] === 'object' && !Array.isArray(update[key])) { // params
			Object.keys(update[key]).forEach(key2 => {
				updateObj[`${key}.${key2}`] = update[key][key2];
			});

			if (key.includes('Params')) { // up to 1 params per document!
				if (!updateObj.$unset) {
					updateObj.$unset = {};
				}

				params.forEach(param => {
					if (key.split('P')[0] !== param) {
						updateObj.$unset[`${param}Params`] = 1;
					}
				});
			}
		} else { // regular field
			if (key === 'dataType' && update.dataType === 'boolean') { // boolean has no params!
				if (!updateObj.$unset) {
					updateObj.$unset = {};
				}

				params.forEach(param => {
					updateObj.$unset[`${param}Params`] = 1;
				});
			}

			updateObj[key] = update[key];
		}
	});

	if (updateObj.$unset) { // avoid same field conflicts.
		Object.keys(updateObj).filter(key => key.includes('Params')).forEach(key => {
			if (updateObj.$unset[key.split('.')[0]]) {
				delete updateObj[key];
			}
		});
	}

	return updateObj;
}
