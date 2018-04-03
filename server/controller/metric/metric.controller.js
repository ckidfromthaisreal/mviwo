/* metric schema. */
const Metric = require('../../model/metric/metric.model');

/* metric-group schema. */
const MetricGroup = require('../../model/metric-group/metric-group.model');

/* mongodb's object id object. */
const ObjectID = require('mongodb').ObjectID;

/* custom-made logger module. */
const logger = require('../../util/logger');

/**
 * fetches all metrics in db.
 * @param {*} req http request
 * @param {*} res http response
 * @param {*} next 
 */
exports.getAll = (req, res, next) => {
    const query = Metric.find();
    const logme = 'metric-controller.js:getAll';

    if (req.headers && req.headers.select) {
        query.select(req.headers.select);
    }

    if (req.headers && !req.headers.noPopulate && 
            (!req.headers.select || req.headers.select.includes('groups'))) {
        query.populate({
            path: 'groups',
            select: 'name description'
        });
    }

    query.exec((err, results) => {
        if (err) {
            logger.log(false, logme, err);
            next(err);
        } else {
            logger.log(true, logme, 'fetched ' + results.length + ' metrics');
            res.status(200).json(results);
        }
    });
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.getOne = (req, res, next) => {
    // TODO
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