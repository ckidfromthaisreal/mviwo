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
  logger.info('API', operationName, `req.headers${JSON.stringify(req.headers)}`);

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

    Metric.insertMany(req.body.resources, { ordered: false }, (err, docs) => {
        if (err) {
            logger.error('API', operationName, err);
            next(err);
        } else {
            // logger.debug('API', operationName, docs);

            addToMetricGroups(buildAddedMetricGroups(docs), (err, success) => {
              if (err) {
                logger.error('API', operationName, err);
                next(err);
              } else {
                logger.info('API', operationName, `inserted ${docs.length} metrics`);
                res.status(200).json(docs);
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
 * @todo
 */
exports.insertOne = (req, res, next) => {
    const operationName = 'metric.controller:insertOne';
    const objectId = mongoose.Types.ObjectId();
    // Metric.insertOne(req.body.resources, (err, doc) => {
    //     if (err) {
    //         logger.log(false, operationName, err);
    //         next(err);
    //     } else {
    //         logger.log(true, operationName, `metric ${doc._id} inserted`);
    //         res.status(200).json(doc);
    //         addToMetricGroups(buildAddedMetricGroups([doc]));
    //     }
    // });
};


/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @todo
 */
exports.updateMany = (req, res, next) => {
    // TODO
}

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @todo
 */
exports.updateOne = (req, res, next) => {
    // TODO
};

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @todo
 */
exports.deleteMany = (req, res, next) => {
    // TODO
};

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @todo
 */
exports.deleteOne = (req, res, next) => {
    // TODO
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

    logger.debug('UTIL', operationName, `added${added}`);
    if (added) {
        added.forEach(element => {
            ops.push(
                {
                    updateOne: {
                        filter: {_id: element.group},
                        update: {
                          $addToSet: { metrics: { $each: element.metrics } },
                          'lastUpdate': new Date()
                        }
                    }
                }
            );
        });
    }

    if (removed) {
      logger.debug('UTIL', operationName, `removed${JSON.stringify(removed)}`);

        removed.forEach(element => {
            ops.push(
                {
                    updateOne: {
                        filter: {_id: element.group},
                        update: {$pull: {metrics: {$each: element.metrics}}}
                    }
                }
            );
        });
    }

    logger.debug('UTIL', operationName, `ops${ops}`);

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
 * builds added metric-groups array for use in addToMetricGroups / updateMetricGroups.
 * assuming all groups of given metrics are added.
 * @param {any} metrics metrics to be added to metric-groups.
 * @returns array of { group: id, metrics: [mongoose.Types.ObjectId]}
 */
function buildAddedMetricGroups(metrics) {
    added = [];

    metrics.map(metric => { return {_id: mongoose.Types.ObjectId(metric._id), groups: metric.groups}})
      .forEach(metric => {
        metric.groups.map(group => mongoose.Types.ObjectId(group._id)).forEach(groupId => {
            const indexOf = added.findIndex(e => e.group.equals(groupId));
            if (indexOf === -1) {
              added.push({
                  group: mongoose.Types.ObjectId(groupId),
                  metrics: [metric._id]
                });
            } else {
                added[indexOf].metrics.push(metric._id);
            }
        });
    });

    // logger.debug('UTIL', 'metric.controller.js:buildAddedMetricGroups', `added${added}`);

    return added;
}
