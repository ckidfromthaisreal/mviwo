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
 * req.headers.filter - filter object. if not provided, fetches all metrics in db.
 *
 * req.headers.select - specifies which fields should be included in returned metric.
 *
 * req.headers.groupsPopulate = if true, populates metric's groups array with metric-group objects.
 *
 * req.headers.groupsSelect = specifies which fields should be included in returned metric-group objects.
 * @param {*} res http response. expected to return the metric as JSON object.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.getMany = (req, res, next) => {
    const operationName = 'metric.controller.js:getMany';
    logger.verbose('API', operationName, `req.headers${JSON.stringify(req.headers)}`);

    let query;
    if (req.headers.filter) {
        query = Metric.find(JSON.parse(req.headers.filter));
    } else {
        query = Metric.find();
    }

    if (req.headers.select) {
        query.select(req.headers.select);
    }
    if (req.headers.groupspopulate === 'true' &&
        (!req.headers.select || req.headers.select.includes('groups'))) {
        query.populate({
            path: 'groups._id',
            select: `name description ${req.headers.groupsselect}` || 'name description'
        });
    }

    query.exec((err, results) => {
        if (err) {
            logger.error('API', operationName, err);
            next(err);
        } else {
            logger.info('API', operationName, `fetched ${results.length} metrics`);
            res.status(200).json(results);
        }
    });
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
exports.getOne = (req, res, next) => {
    const query = Metric.findById(req.params.id);
    const operationName = 'metric.controller.js:getOne';

    if (req.headers.select) {
        query.select(req.headers.select);
    }

    if (req.headers.groupspopulate === 'true' &&
        (!req.headers.select || req.headers.select.includes('groups'))) {
        query.populate({
            path: 'groups._id',
            select: `name description ${req.headers.groupsselect}` || 'name description'
        });
    }

    query.exec((err, result) => {
        if (err) {
            logger.error('API', operationName, err);
            next(err);
        } else if (result == null) {
            const err = new Error(`metric ${req.params.id} not found`);
            err.status = 404;
            logger.warn('API', operationName, err);
            next(err);
        } else {
            logger.info('API', operationName, `metric ${req.params.id} fetched`);
            res.status(200).json(result);
        }
    });
};

/**
 * inserts new metric/s to db.
 * performs an unordered insertMany which means, will perform a best effort insert.
 * some docs might fail, but won't stop the process.
 * @param {*} req http request.
 *
 * req.body.resources = array of metric objects for insertion.
 *
 * @param {*} res http response. expected to return successfully inserted metrics as
 * an array of JSON objects.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.insertMany = (req, res, next) => {
    const operationName = 'metric.controller:insertMany';
    let err;

    if (!req.body.resources || !req.body.resources.length) {
        err = new Error('invalid input: no resources');
    }

    if (err) {
        logger.error('API', operationName, err);
        next(err);
        return;
    }

    Metric.insertMany(req.body.resources, {
        ordered: true
    }, (err, docs) => {
        if (err) {
            logger.error('API', operationName, err);
            next(err);
        } else {
            addToMetricGroups(buildMetricGroupsModifysArray(docs), (err, success) => {
                if (err) {
                    logger.error('API', operationName, `inserted ${docs.length} metrics with errors: ${err}`);
                    next(err);
                } else {
                    logger.info('API', operationName, `inserted ${docs.length} metrics`);
                    res.status(200).json([docs, success]);
                }
            });
        }
    });
};

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
exports.insertOne = (req, res, next) => {
    const operationName = 'metric.controller:insertOne';
    let err;

    if (!req.body.resources) {
        err = new Error('invalid input: no resources');
        err.status(403);
    }

    if (err) {
        logger.error('API', operationName, err);
        next(err);
        return;
    }

    Metric.create(req.body.resources, (err, doc) => {
        if (err) {
            logger.error('API', operationName, err);
            next(err);
        } else {
            addToMetricGroups(buildMetricGroupsModifysArray(doc), (err, success) => {
                if (err) {
                    logger.error('API', operationName, `metric ${doc._id} inserted with errors: ${err}`);
                    next(err);
                } else {
                    logger.info('API', operationName, `metric ${doc._id} inserted`);
                    res.status(200).json([doc, success]);
                }
            });
        }
    });
};

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
exports.updateMany = (req, res, next) => {
    const operationName = 'metric.controller:updateMany';
    let err = null;

    if (!req.body.resources || typeof req.body.resources !== 'object' ||
        !Array.isArray(req.body.resources) || !req.body.resources.length) {
        err = new Error('invalid input: no resources');
    }

    if (err) {
        logger.error('API', operationName, err);
        next(err);
        return;
    }

    const ops = [];

    req.body.resources.forEach(item => {
        ops.push({
            updateOne: {
                filter: {
                    _id: item._id
                },
                update: buildUpdateObject(item)
            }
        });
    });

    Metric.bulkWrite(ops, (err, result1) => {
        if (err) {
            logger.error('API', operationName, err);
            next(err);
        } else {
            updateMetricGroups(buildMetricGroupsModifysArray(req.body.resources),
                buildMetricGroupsModifysArray(req.body.resources.map(elem => {
                    return {
                        _id: elem._id,
                        groups: elem.removedGroups
                    };
                })), (err, result2) => {
                    if (err) {
                        logger.err('API', operationName, `updated ${result1.nModified} metrics with errors: ${err}`);
                        next(err);
                    } else {
                        logger.info('API', operationName, `updated ${result1.nModified} metrics`);
                        res.status(200).json([result1, result2]);
                    }
                }
            );
        }
    });
};

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
exports.updateOne = (req, res, next) => {
    const operationName = 'metric.controller:updateOne';
    let err = null;

    if (!req.body.resources || typeof req.body.resources !== 'object' ||
        !Object.keys(req.body.resources).length) {
        err = new Error('invalid input: no resources');
    }

    if (err) {
        logger.error('API', operationName, err);
        next(err);
        return;
    }

    Metric.findByIdAndUpdate(req.params.id, buildUpdateObject(req.body.resources), {
        new: true
    }, (err, doc) => {
        if (err) {
            logger.error('API', operationName, err);
            next(err);
        } else {
            if (req.body.resources.groups || req.body.resources.removedGroups) {
                updateMetricGroups(buildMetricGroupsModifysArray({
                    _id: req.params.id,
                    groups: req.body.resources.groups
                }), buildMetricGroupsModifysArray({
                    _id: req.params.id,
                    groups: req.body.resources.removedGroups
                }), (err, success) => {
                    if (err) {
                        logger.error('API', operationName, `metric ${req.params.id} updated with errors: ${err}`);
                        next(err);
                    } else {
                        logger.info('API', operationName, `metric ${req.params.id} updated`);
                        res.status(200).json([doc, success]);
                    }
                });
            } else {
                logger.info('API', operationName, `metric ${req.params.id} updated`);
                res.status(200).json([doc, {
                    nModified: 0
                }]);
            }
        }
    });
};

/**
 * deletes metrics from db.
 * @param {*} req http request.
 *
 * req.body.resources = array of objects: { _id: String, groups: [String] }
 *
 * @param {*} res http response.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.deleteMany = (req, res, next) => {
    const operationName = 'metric.controller:deleteOne';
    let err = null;

    if (!req.body.resources || !req.body.resources.length) {
        err = new Error('invalid input: no resources');
    }

    if (err) {
        logger.error('API', operationName, err);
        next(err);
        return;
    }

    Metric.deleteMany({
        _id: {
            $in: req.body.resources.map(elem => elem._id)
        }
    }, (err, result) => {
        if (err) {
            logger.error('API', operationName, err);
            next(err);
        } else {
            removeFromMetricGroups(buildMetricGroupsModifysArray(req.body.resources), (err, success) => {
                if (err) {
                    logger.error('API', operationName, `deleted ${req.body.resources.length} metrics with errors: ${err}`);
                    next(err);
                } else {
                    logger.info('API', operationName, `deleted ${req.body.resources.length} metrics`);
                    res.status(200).json([result, success]);
                }
            });
        }
    });
};

/**
 *
 * @param {*} req http request.
 *
 * req.body.groups - array of metric-groups ids to remove metric from.
 *
 * @param {*} res http response. expected to return a result object.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.deleteOne = (req, res, next) => {
    const operationName = 'metric.controller:deleteOne';

    Metric.deleteOne({
        _id: req.params.id
    }, (err, result) => {
        if (err) {
            logger.error('API', operationName, err);
            next(err);
        } else {
            removeFromMetricGroups(buildMetricGroupsModifysArray({
                _id: req.params.id,
                groups: req.body.groups
            }), (err, success) => {
                if (err) {
                    logger.error('API', operationName, `metric ${req.params.id} deleted with errors: ${err}`);
                    next(err);
                } else {
                    logger.info('API', operationName, `metric ${req.params.id} deleted`);
                    res.status(200).json([result, success]);
                }
            });
        }
    });
};

/**
 * adds metrics to metric-groups.
 * if performing multiple removeFrom / addTo calls, use updateMetricGroups instead!
 * @param {any} added array of { group: id, metrics: [mongoose.Types.ObjectId]} metric-groups to add to.
 */
function addToMetricGroups(added, callback) {
    updateMetricGroups(added, null, callback);
}

/**
 * removes metrics from metric-groups.
 * if performing multiple removeFrom / addTo calls, use updateMetricGroups instead!
 * @param {any} removed array of { group: id, metrics: [mongoose.Types.ObjectId]} metric-groups to remove from.
 */
function removeFromMetricGroups(removed, callback) {
    updateMetricGroups(null, removed, callback);
}

/**
 * updates metric-groups' metrics arrays.
 * @param {any} added array of { group: id, metrics: [mongoose.Types.ObjectId]} metric-groups to add to.
 * @param {any} removed array of { group: id, metrics: [mongoose.Types.ObjectId]} metric-groups to remove from.
 */
function updateMetricGroups(added, removed, callback) {
    const operationName = 'metric.controller:updateMetricGroups';
    const ops = [];

    if (added && added.length) {
        added.forEach(element => {
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
                        'lastUpdate': new Date()
                    }
                }
            });
        });
    }

    if (removed && removed.length) {
        removed.forEach(element => {
            ops.push({
                updateOne: {
                    filter: {
                        _id: element.group
                    },
                    update: {
                        $pullAll: {
                            metrics: element.metrics
                        },
                        'lastUpdate': new Date()
                    }
                }
            });
        });
    }

    if (ops.length > 0) {
        MetricGroup.bulkWrite(ops, (err, result) => {
            if (err) {
                callback(err);
            } else {
                callback(null, result);
            }
        });
    } else {
        callback(null, {});
    }
}

/**
 * builds metric-groups array for use in addToMetricGroups / removeFromMetricsGroups / updateMetricGroups.
 * @param {any} metrics
 * @returns array of { group: mongoose.Types.ObjectId, metrics: [mongoose.Types.ObjectId]}
 */
function buildMetricGroupsModifysArray(metrics) {
    const groups = [];
    metrics = Array.isArray(metrics) ? metrics : [metrics];

    metrics.map(metric => {
            return {
                _id: mongoose.Types.ObjectId(metric._id),
                groups: metric.groups || []
            };
        })
        .forEach(metric => {
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
 * @param {*} update object containing key : nuValue pairs
 * @return update objects array.
 */
function buildUpdateObject(update) {
    const updateObj = {
        lastUpdate: new Date()
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
