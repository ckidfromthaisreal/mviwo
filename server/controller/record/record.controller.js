/*
record controller.
*/

/** server config file. */
const config = require('../../server.json');

/** http://mongoosejs.com/
  mongoose provides a straight-forward, schema-based solution to model your application data.
  it includes built-in type casting, validation, query building, business logic hooks and more,
  out of the box.
*/
const mongoose = require('mongoose').set('debug', config.DEBUG_MONGOOSE);

/** record model. */
const Record = require('../../model/record/record.model');

/** custom-made logger module. */
const logger = require('../../util/logger');

/**
 * fetches records from db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.headers.filter - filter object. if not provided, fetches all records in db.
 *
 * req.headers.fields - specifies which fields should be included in returned record.
 * @param {*} res http response. expected to return records as JSON object array.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.getMany = async (req, res, next) => {
	const operationName = 'record.controller.js:getMany';
	logger.verbose('API', operationName, `req.headers${JSON.stringify(req.headers)}`);

	let query;
	if (req.headers.filter) {
		query = Record.find(JSON.parse(req.headers.filter));
	} else {
		query = Record.find();
	}

	if (req.headers.fields) {
		query.select(req.headers.fields);
	}

	try {
		const records = await query.exec();
		logger.info('API', operationName, `fetched ${records.length} records`);
		logger.verbose('API', operationName, `${records.length} records: ${JSON.stringify(records)} fetched`, req.user);
		res.status(200).json(records);
	} catch (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}
};

/**
 * fetches a record from db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.headers.fields - specifies which fields should be included in returned record.
 * @param {*} res http response. expected to return the record as JSON object.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.getOne = async (req, res, next) => {
	const operationName = 'record.controller.js:getOne';
	const query = Record.findById(req.params.id);

	if (req.headers.fields) {
		query.select(req.headers.fields);
	}

	try {
		const record = await query.exec();

		if (!record) {
			const err = `record ${req.params.id} not found`;
			logger.warn('API', operationName, err, req.user._id);
			logger.verbose('API', operationName, err, req.user);
			res.status(404).send(err);
		} else {
			logger.info('API', operationName, `record ${req.params.id} fetched`, req.user._id);
			logger.verbose('API', operationName, `record ${record} fetched`, req.user);
			res.status(200).json(record);
		}
	} catch (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}
};

/**
 * inserts new records to db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.body = array of record objects for insertion.
 *
 * @param {*} res http response. expected to return successfully inserted records as
 * an array of JSON objects.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.insertMany = async (req, res, next) => {
	const operationName = 'record.controller:insertMany';
	let err;

	if (!req.body || !req.body.length) {
		err = new Error('invalid input: no resources');
	}

	if (err) {
		logger.error('API', operationName, err, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}

	let records;

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
		records = await Record.insertMany(insertObjs);
	} catch (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}

	logger.info('API', operationName, `${records.length} records inserted`, req.user._id);
	logger.verbose('API', operationName, `${records.length} records ${JSON.stringify(records)} inserted`, req.user);
	res.status(200).json(records);
};

/**
 * inserts a new record to db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.body = record object for insertion.
 *
 * @param {*} res http response. expected to return successfully inserted record as
 * a JSON object.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.insertOne = async (req, res, next) => {
	const operationName = 'record.controller:insertOne';
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

	let record;

	const userObj = {
		_id: mongoose.Types.ObjectId(req.user._id),
		username: req.user.username
	};

	const insertObj = req.body;
	insertObj.createdBy = userObj;
	insertObj.updatedBy = userObj;

	try {
		record = await Record.create(insertObj);
	} catch (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}

	logger.info('API', operationName, `record ${record._id} inserted`, req.user._id);
	logger.verbose('API', operationName, `record ${record} inserted`, req.user);
	res.status(200).json(record);
};

/**
 * updates records in db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.body = object with key : nuValue pairs,
 * also includes _id field for finding.
 *
 * @param {*} res http response. expected to return successfully updated records as
 * a JSON object.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.updateMany = async (req, res, next) => {
	const operationName = 'record.controller:updateMany';
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

	let result;

	try {
		result = await Record.bulkWrite(ops);
	} catch (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}

	logger.info('API', operationName, `${result.nModified} records updated`, req.user._id);
	logger.verbose('API', operationName, `${result.nModified} records ${JSON.stringify(ops)} updated`, req.user);
	res.status(200).json(result);
};

/**
 * updates a record in db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.body = object with key : nuValue pairs,
 * @param {*} res http response. expected to return successfully updated record as
 * a JSON object.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.updateOne = async (req, res, next) => {
	const operationName = 'record.controller:updateOne';
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

	let record;

	try {
		record = await Record.findByIdAndUpdate(
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

	logger.info('API', operationName, `record ${req.params.id} updated`, req.user._id);
	logger.verbose('API', operationName, `record ${record} updated`, req.user);
	res.status(200).json(record);
};

/**
 * deletes records from db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * @param {*} res http response.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.deleteMany = async (req, res, next) => {
	const operationName = 'record.controller:deleteOne';
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
		result = await Record.deleteMany({
			_id: {
				$in: req.body.map(elem => elem._id)
			}
		});
	} catch (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}

	logger.info('API', operationName, `${req.body.length} records deleted`, req.user._id);
	logger.verbose('API', operationName, `${req.body.length} records ${JSON.stringify(req.body)} deleted`, req.user);
	res.status(200).json(result);
};

/**
 * deletes a record from db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * @param {*} res http response. expected to return a result object.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.deleteOne = async (req, res, next) => {
	const operationName = 'record.controller:deleteOne';

	let result;

	try {
		result = await Record.deleteOne({
			_id: req.params.id
		});
	} catch (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}

	logger.info('API', operationName, `record ${req.params.id} deleted`, req.user._id);
	logger.verbose('API', operationName, `record ${req.params.id} deleted`, req.user);
	res.status(200).json(result);
};

/**
 * builds update object arrays for update queries.
 * @param {*} update object containing key : nuValue pairs.
 * tolerant to _id and removedLocations fields presence.
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

	Object.keys(update).forEach(key => updateObj[key] = update[key]);

	return updateObj;
}
