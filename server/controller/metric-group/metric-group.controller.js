/*
metric-group controller.
*/

/** server config file. */
// const config = require('../../server.json');

/** http://mongoosejs.com/
  mongoose provides a straight-forward, schema-based solution to model your application data.
  it includes built-in type casting, validation, query building, business logic hooks and more,
  out of the box.
*/
// const mongoose = require('mongoose').set('debug', config.DEBUG_MONGOOSE);

/** metric-group model. */
const MetricGroup = require('../../model/metric-group/metric-group.model');

/** metric model. */
// const Metric = require('../../model/metric/metric.model');

/** custom-made logger module. */
const logger = require('../../util/logger');

/**
 * fetches metric-groups from db.
 * @param {*} req http request.
 *
 * req.headers.filter - filter object. if not provided, fetches all metric-groups in db.
 *
 * req.headers.select - specifies which fields should be included in returned metric.
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

	if (req.headers.select) {
		query.select(req.headers.select);
	}

	if (req.headers.metricspopulate === 'true' &&
		(!req.headers.select || req.headers.select.includes('metrics'))) {
		query.populate({
			// path: 'metrics._id', // not denormalized yet
			path: 'metrics',
			// select: `name description ${req.headers.metricsselect}` || 'name description'
			select: req.headers.metricsselect
		});
	}

	try {
		const groups = await query.exec();
		logger.info('API', operationName, `fetched ${groups.length} metric-groups`);
		res.status(200).json(groups);
	} catch (err) {
		logger.error('API', operationName, err);
		return next(err);
	}
};

/**
 * fetches a metric from db.
 * @param {*} req http request.
 *
 * req.headers.select - specifies which fields should be included in returned metric.
 *
 * req.headers.groupsPopulate = if true, populates metric's groups array with metric-group objects.
 *
 * req.headers.groupsSelect = specifies which fields should be included in returned metric-group objects.
 * @param {*} res http response. expected to return the metric as JSON object.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
// exports.getOne = async (req, res, next) => {
// 	const operationName = 'metric.controller.js:getOne';
// 	const query = Metric.findById(req.params.id);

// 	if (req.headers.select) {
// 		query.select(req.headers.select);
// 	}

// 	if (req.headers.groupspopulate === 'true' &&
// 		(!req.headers.select || req.headers.select.includes('groups'))) {
// 		query.populate({
// 			path: 'groups._id',
// 			select: `name description ${req.headers.groupsselect}` || 'name description'
// 		});
// 	}

// 	try {
// 		const metric = await query.exec();

// 		if (metric === null) {
// 			const err = new Error(`metric ${req.params.id} not found`);
// 			err.status = 404;
// 			logger.error('API', operationName, err);
// 			return next(err);
// 		} else {
// 			logger.info('API', operationName, `metric ${req.params.id} fetched`);
// 			res.status(200).json(metric);
// 		}
// 	} catch (err) {
// 		logger.error('API', operationName, err);
// 		return next(err);
// 	}
// };

/**
 * inserts new metrics to db.
 * @param {*} req http request.
 *
 * req.body.resources = array of metric objects for insertion.
 *
 * @param {*} res http response. expected to return successfully inserted metrics as
 * an array of JSON objects.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
// exports.insertMany = async (req, res, next) => {
// 	const operationName = 'metric.controller:insertMany';
// 	let err;

// 	if (!req.body.resources || !req.body.resources.length) {
// 		err = new Error('invalid input: no resources');
// 	}

// 	if (err) {
// 		logger.error('API', operationName, err);
// 		return next(err);
// 	}

// 	let metrics, result;

// 	try {
// 		metrics = await Metric.insertMany(req.body.resources);
// 	} catch (err) {
// 		logger.error('API', operationName, err);
// 		return next(err);
// 	}

// 	try {
// 		result = await addToMetricGroups(metrics);
// 	} catch (err) {
// 		logger.error('API', operationName, `inserted ${metrics.length} metrics with errors: ${err}`);
// 		return next(err);
// 	}

// 	logger.info('API', operationName, `inserted ${metrics.length} metrics`);
// 	res.status(200).json([metrics, result]);
// };

/**
 * inserts a new metric to db.
 * @param {*} req http request.
 *
 * req.body.resources = metric object for insertion.
 *
 * @param {*} res http response. expected to return successfully inserted metric as
 * a JSON object.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
// exports.insertOne = async (req, res, next) => {
// 	const operationName = 'metric.controller:insertOne';
// 	let err;

// 	if (!req.body.resources) {
// 		err = new Error('invalid input: no resources');
// 		err.status(403);
// 	}

// 	if (err) {
// 		logger.error('API', operationName, err);
// 		return next(err);
// 	}

// 	let metric, result;

// 	try {
// 		metric = await Metric.create(req.body.resources);
// 	} catch (err) {
// 		logger.error('API', operationName, err);
// 		return next(err);
// 	}

// 	try {
// 		result = await addToMetricGroups(metric);
// 	} catch (err) {
// 		logger.error('API', operationName, `metric ${metric._id} inserted with errors: ${err}`);
// 		return next(err);
// 	}

// 	logger.info('API', operationName, `metric ${metric._id} inserted`);
// 	res.status(200).json([metric, result]);
// };

/**
 * updates metrics in db.
 * @param {*} req http request.
 *
 * req.body.resources = object with key : nuValue pairs,
 * also includes _id field for finding.
 *
 * @param {*} res http response. expected to return successfully inserted metric as
 * a JSON object.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
// exports.updateMany = async (req, res, next) => {
// 	const operationName = 'metric.controller:updateMany';
// 	let err = null;

// 	if (!req.body.resources || typeof req.body.resources !== 'object' ||
// 		!Array.isArray(req.body.resources) || !req.body.resources.length) {
// 		err = new Error('invalid input: no resources');
// 	}

// 	if (err) {
// 		logger.error('API', operationName, err);
// 		return next(err);
// 	}

// 	const ops = [];

// 	req.body.resources.forEach(item => {
// 		ops.push({
// 			updateOne: {
// 				filter: {
// 					_id: item._id
// 				},
// 				update: buildUpdateObject(item)
// 			}
// 		});
// 	});

// 	let result1, result2;

// 	try {
// 		result1 = await Metric.bulkWrite(ops);
// 	} catch (err) {
// 		logger.error('API', operationName, err);
// 		return next(err);
// 	}

// 	try {
// 		result2 = await updateMetricGroups(
// 			req.body.resources,
// 			req.body.resources.map(elem => {
// 				return {
// 					_id: elem._id,
// 					groups: elem.removedGroups
// 				};
// 			}));
// 	} catch (err) {
// 		logger.err('API', operationName, `updated ${result1.nModified} metrics with errors: ${err}`);
// 		return next(err);
// 	}

// 	logger.info('API', operationName, `updated ${result1.nModified} metrics`);
// 	res.status(200).json([result1, result2]);
// };


/**
 * updates a metric in db.
 * @param {*} req http request.
 *
 * req.body.resources = object with key : nuValue pairs,
 * and also (optional) removedGroups property with group id's array.
 *
 * @param {*} res http response. expected to return successfully inserted metric as
 * a JSON object.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
// exports.updateOne = async (req, res, next) => {
// 	const operationName = 'metric.controller:updateOne';
// 	let err = null;

// 	if (!req.body.resources || typeof req.body.resources !== 'object' ||
// 		!Object.keys(req.body.resources).length) {
// 		err = new Error('invalid input: no resources');
// 	}

// 	if (err) {
// 		logger.error('API', operationName, err);
// 		return next(err);
// 	}

// 	let metric, result = {
// 		nModified: 0
// 	};

// 	try {
// 		metric = await Metric.findByIdAndUpdate(
// 			req.params.id,
// 			buildUpdateObject(req.body.resources), {
// 				new: true
// 			}
// 		);
// 	} catch (err) {
// 		logger.error('API', operationName, err);
// 		return next(err);
// 	}

// 	if (req.body.resources.groups || req.body.resources.removedGroups) {
// 		try {
// 			result = await updateMetricGroups({
// 				_id: req.params.id,
// 				groups: req.body.resources.groups
// 			}, {
// 				_id: req.params.id,
// 				groups: req.body.resources.removedGroups
// 			});
// 		} catch (err) {
// 			logger.error('API', operationName, `metric ${req.params.id} updated with errors: ${err}`);
// 			return next(err);
// 		}
// 	}

// 	logger.info('API', operationName, `metric ${req.params.id} updated`);
// 	res.status(200).json([metric, result]);
// };

/**
 * deletes metrics from db.
 * @param {*} req http request.
 *
 * req.body.resources = array of objects: { _id: String, groups: [String] }
 *
 * @param {*} res http response.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
// exports.deleteMany = async (req, res, next) => {
// 	const operationName = 'metric.controller:deleteOne';
// 	let err = null;

// 	if (!req.body.resources || !req.body.resources.length) {
// 		err = new Error('invalid input: no resources');
// 	}

// 	if (err) {
// 		logger.error('API', operationName, err);
// 		return next(err);
// 	}

// 	let result1, result2;

// 	try {
// 		result1 = await Metric.deleteMany({
// 			_id: {
// 				$in: req.body.resources.map(elem => elem._id)
// 			}
// 		});
// 	} catch (err) {
// 		logger.error('API', operationName, err);
// 		return next(err);
// 	}

// 	try {
// 		result2 = await removeFromMetricGroups(req.body.resources);
// 	} catch (err) {
// 		logger.error('API', operationName, `deleted ${req.body.resources.length} metrics with errors: ${err}`);
// 		return next(err);
// 	}

// 	logger.info('API', operationName, `deleted ${req.body.resources.length} metrics`);
// 	res.status(200).json([result1, result2]);
// };

/**
 * deletes a metric from db.
 * @param {*} req http request.
 *
 * req.body.groups - array of metric-groups ids to remove metric from.
 *
 * @param {*} res http response. expected to return a result object.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
// exports.deleteOne = async (req, res, next) => {
// 	const operationName = 'metric.controller:deleteOne';

// 	let result1, result2;

// 	try {
// 		result1 = await Metric.deleteOne({
// 			_id: req.params.id
// 		});
// 	} catch (err) {
// 		logger.error('API', operationName, err);
// 		return next(err);
// 	}

// 	try {
// 		result2 = await removeFromMetricGroups({
// 			_id: req.params.id,
// 			groups: req.body.groups
// 		});
// 	} catch (err) {
// 		logger.error('API', operationName, `metric ${req.params.id} deleted with errors: ${err}`);
// 		return next(err);
// 	}

// 	logger.info('API', operationName, `metric ${req.params.id} deleted`);
// 	res.status(200).json([result1, result2]);
// };

/**
 * adds metric/s to metric-groups.
 * if performing both remove and add, use updateMetricGroups instead!
 * @param {any} addObj object or array of objects: { _id: string, groups: [string]}.
 * metric/s will be added to these groups.
 * @returns promise.
 */
// function addToMetricGroups(addObj) {
// 	return updateMetricGroups(addObj, null);
// }

/**
 * removes metric/s from metric-groups.
 * if performing both remove and add, use updateMetricGroups instead!
 * @param {any} removeObj object or array of objects: { _id: string, groups: [string]}.
 * metric/s will be removed from these groups.
 * @returns promise.
 */
// function removeFromMetricGroups(removeObj) {
// 	return updateMetricGroups(null, removeObj);
// }

/**
 * updates metric-groups' metrics arrays.
 * @param {any} addObj object or array of objects: { _id: string, groups: [string]}.
 * metric/s will be added to these groups.
 * @param {any} removeObj object or array of objects: { _id: string, groups: [string]}.
 * metric/s will be removed from these groups.
 * @returns promise.
 */
// function updateMetricGroups(addObj, removeObj) {
// 	// const operationName = 'metric.controller:updateMetricGroups';

// 	/** used in bulkWrite. */
// 	const ops = [];

// 	if (addObj) {
// 		addObj = pivotToGroups(addObj);

// 		addObj.forEach(element => {
// 			ops.push({
// 				updateOne: {
// 					filter: {
// 						_id: element.group
// 					},
// 					update: {
// 						$addToSet: {
// 							metrics: {
// 								$each: element.metrics
// 							}
// 						},
// 						'lastUpdate': new Date()
// 					}
// 				}
// 			});
// 		});
// 	}

// 	if (removeObj) {
// 		removeObj = pivotToGroups(removeObj);

// 		removeObj.forEach(element => {
// 			ops.push({
// 				updateOne: {
// 					filter: {
// 						_id: element.group
// 					},
// 					update: {
// 						$pullAll: {
// 							metrics: element.metrics
// 						},
// 						'lastUpdate': new Date()
// 					}
// 				}
// 			});
// 		});
// 	}

// 	return new Promise((resolve, reject) => {
// 		if (ops.length > 0) {
// 			MetricGroup.bulkWrite(ops, (err, result) => {
// 				if (err) {
// 					reject(err);
// 				} else {
// 					resolve(result);
// 				}
// 			});
// 		} else {
// 			resolve({
// 				nModified: 0
// 			});
// 		}
// 	});
// }

/**
 * utility function used in updateMetricGroups(...).
 * turns a metric centered object or object array to group centered array.
 * @param {any} metricsObj metric centered object or object array.
 * @returns group centered object array.
 */
// function pivotToGroups(metricsObj) {
// 	const groups = [];
// 	metricsObj = Array.isArray(metricsObj) ? metricsObj : [metricsObj];

// 	metricsObj.map(metric => {
// 		return {
// 			_id: mongoose.Types.ObjectId(metric._id),
// 			groups: metric.groups || []
// 		};
// 	}).forEach(metric => {
// 		metric.groups.map(group => mongoose.Types.ObjectId(group._id || group)).forEach(groupId => {
// 			const indexOf = groups.findIndex(e => e.group.equals(groupId));
// 			if (indexOf === -1) {
// 				groups.push({
// 					group: mongoose.Types.ObjectId(groupId),
// 					metrics: [metric._id]
// 				});
// 			} else {
// 				groups[indexOf].metrics.push(metric._id);
// 			}
// 		});
// 	});

// 	return groups;
// }

/**
 * builds update object arrays for update queries.
 * @param {*} update object containing key : nuValue pairs.
 * tolerant to _id and removedGroups fields presence.
 * @return update objects array.
 */
// function buildUpdateObject(update) {
// 	const updateObj = {
// 		lastUpdate: new Date()
// 	};
// 	const params = ['number', 'string', 'enum', 'blob', 'date'];

// 	update = JSON.parse(JSON.stringify(update)); //clone
// 	delete update.removedGroups; // not an actual field.
// 	delete update._id; // not an actual change.

// 	Object.keys(update).forEach(key => {
// 		if (typeof update[key] === 'object' && !Array.isArray(update[key])) { // params
// 			Object.keys(update[key]).forEach(key2 => {
// 				updateObj[`${key}.${key2}`] = update[key][key2];
// 			});

// 			if (key.includes('Params')) { // up to 1 params per document!
// 				if (!updateObj.$unset) {
// 					updateObj.$unset = {};
// 				}

// 				params.forEach(param => {
// 					if (key.split('P')[0] !== param) {
// 						updateObj.$unset[`${param}Params`] = 1;
// 					}
// 				});
// 			}
// 		} else { // regular field
// 			if (key === 'dataType' && update.dataType === 'boolean') { // boolean has no params!
// 				if (!updateObj.$unset) {
// 					updateObj.$unset = {};
// 				}

// 				params.forEach(param => {
// 					updateObj.$unset[`${param}Params`] = 1;
// 				});
// 			}

// 			updateObj[key] = update[key];
// 		}
// 	});

// 	if (updateObj.$unset) { // avoid same field conflicts.
// 		Object.keys(updateObj).filter(key => key.includes('Params')).forEach(key => {
// 			if (updateObj.$unset[key.split('.')[0]]) {
// 				delete updateObj[key];
// 			}
// 		});
// 	}

// 	return updateObj;
// }
