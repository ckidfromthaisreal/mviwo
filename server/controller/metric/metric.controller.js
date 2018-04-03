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
 * fetches all metrics in db.
 * @param {*} req http request
 * @param {*} res http response
 * @param {*} next 
 */
exports.getAll = (req, res, next) => {
    const query = Metric.find();
    const operationName = 'metric.controller.js:getAll';

    if (req.headers) {
        if (req.headers.select) {
            query.select(req.headers.select);
        }

        if (!req.headers.noPopulate &&
                (!req.headers.select || req.headers.select.includes('groups'))) {
            query.populate({
                path: 'groups',
                select: 'name description'
            });
        }
    }

    query.exec((err, results) => {
        if (err) {
            logger.log(false, operationName, err);
            next(err);
        } else {
            logger.log(true, operationName, `fetched ${results.length} metrics`);
            res.status(200).json(results);
        }
    });
};

/**
 * fetches a metric from db.
 * @param {*} req http request
 * @param {*} res http response
 * @param {*} next 
 */
exports.getOne = (req, res, next) => {
    // const query = Metric.findById(new mongoose.Types.ObjectId(req.params.id));
    const query = Metric.findById(req.params.id);
    // const query = Metric.find({_id: req.params.id});
    const operationName = 'metric.controller.js:getOne';

    if (req.headers && req.headers.select) {
        query.select(req.headers.select);
    }

    if (req.headers) {
        if (req.headers.select) {
            query.select(req.headers.select);
        }

        if (!req.headers.noPopulate &&
                (!req.headers.select || req.headers.select.includes('groups'))) {
            query.populate({
                path: 'groups',
                select: 'name description'
            });
        }
    }

    query.exec((err, result) => {
        if (err) {
            logger.log(false, operationName, err);
            next(err);
        } else if (result == null) {
            const err = new Error(`metric ${req.params.id} not found`);
            err.status = 404;
            logger.log(false, operationName, err);
            next(err);
        } else {
            logger.log(true, operationName, `metric ${req.params.id} fetched`);
            res.status(200).json(result);
        }
    });
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.insert = (req, res, next) => {
    // TODO
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.updateOne = (req, res, next) => {
    // TODO
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.deleteOne = (req, res, next) => {
    // TODO
};