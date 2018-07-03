/*
location controller.
*/

/** server config file. */
const config = require('../../server.json');

/** http://mongoosejs.com/
  mongoose provides a straight-forward, schema-based solution to model your application data.
  it includes built-in type casting, validation, query building, business logic hooks and more,
  out of the box.
*/
const mongoose = require('mongoose').set('debug', config.DEBUG_MONGOOSE);

/** location model. */
const Location = require('../../model/location/location.model');

/** patient model. */
const Patient = require('../../model/patient/patient.model');

/** custom-made logger module. */
const logger = require('../../util/logger');

/**
 * fetches locations from db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.headers.filter - filter object. if not provided, fetches all locations in db.
 *
 * req.headers.fields - specifies which fields should be included in returned location.
 *
 * req.headers.patientsPopulate = if true, populates location's patients array with patient objects.
 *
 * req.headers.patientsSelect = specifies which fields should be included in returned patient objects.
 * @param {*} res http response. expected to return locations as JSON object array.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.getMany = async (req, res, next) => {
	const operationName = 'location.controller.js:getMany';
	logger.verbose('API', operationName, `req.headers${JSON.stringify(req.headers)}`);

	let query;
	if (req.headers.filter) {
		query = Location.find(JSON.parse(req.headers.filter));
	} else {
		query = Location.find();
	}

	if (req.headers.fields) {
		query.select(req.headers.fields);
	}

	if (req.headers.patientspopulate === 'true' &&
		(!req.headers.fields || req.headers.fields.includes('patients'))) {
		query.populate({
			path: 'patients._id',
			select: req.headers.patientsselect
		});
	}

	try {
		const locations = await query.exec();
		logger.info('API', operationName, `fetched ${locations.length} locations`);
		logger.verbose('API', operationName, `${locations.length} locations: ${JSON.stringify(locations)} fetched`, req.user);
		res.status(200).json(locations);
	} catch (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}
};

/**
 * fetches a location from db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.headers.fields - specifies which fields should be included in returned location.
 *
 * req.headers.patientsPopulate = if true, populates location's patients array with patient objects.
 *
 * req.headers.patientsSelect = specifies which fields should be included in returned patient objects.
 * @param {*} res http response. expected to return the location as JSON object.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.getOne = async (req, res, next) => {
	const operationName = 'location.controller.js:getOne';
	const query = Location.findById(req.params.id);

	if (req.headers.fields) {
		query.select(req.headers.fields);
	}

	if (req.headers.patientspopulate === 'true' &&
		(!req.headers.fields || req.headers.fields.includes('patients'))) {
		query.populate({
			path: 'patients._id',
			select: req.headers.patientsselect
		});
	}

	try {
		const location = await query.exec();

		if (!location) {
			const err = `location ${req.params.id} not found`;
			logger.warn('API', operationName, err, req.user._id);
			logger.verbose('API', operationName, err, req.user);
			res.status(404).send(err);
		} else {
			logger.info('API', operationName, `location ${req.params.id} fetched`, req.user._id);
			logger.verbose('API', operationName, `location ${location} fetched`, req.user);
			res.status(200).json(location);
		}
	} catch (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}
};

/**
 * inserts new locations to db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.body = array of location objects for insertion.
 *
 * @param {*} res http response. expected to return successfully inserted locations as
 * an array of JSON objects.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.insertMany = async (req, res, next) => {
	const operationName = 'location.controller:insertMany';
	let err;

	if (!req.body || !req.body.length) {
		err = new Error('invalid input: no resources');
	}

	if (err) {
		logger.error('API', operationName, err, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}

	let locations, result;

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
		locations = await Location.insertMany(insertObjs);
	} catch (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}

	try {
		result = await addToPatients(locations, req.user);
	} catch (err) {
		logger.error('API', operationName, `${locations.length} locations inserted with errors: ${err.message},`, req.user._id);
		logger.verbose('API', operationName, `${locations.length} locations ${JSON.stringify(locations)} inserted with errors: ${err},`, req.user);
		return next(err);
	}

	logger.info('API', operationName, `${locations.length} locations inserted`, req.user._id);
	logger.verbose('API', operationName, `${locations.length} locations ${JSON.stringify(locations)} inserted`, req.user);
	res.status(200).json([locations, result]);
};

/**
 * inserts a new location to db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.body = location object for insertion.
 *
 * @param {*} res http response. expected to return successfully inserted location as
 * a JSON object.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.insertOne = async (req, res, next) => {
	const operationName = 'location.controller:insertOne';
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

	let location, result;

	const userObj = {
		_id: mongoose.Types.ObjectId(req.user._id),
		username: req.user.username
	};

	const insertObj = req.body;
	insertObj.createdBy = userObj;
	insertObj.updatedBy = userObj;

	try {
		location = await Location.create(insertObj);
	} catch (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}

	try {
		result = await addToPatients(location, req.user);
	} catch (err) {
		logger.error('API', operationName, `location ${location._id} inserted with errors: ${err.message},`, req.user._id);
		logger.verbose('API', operationName, `location ${location} inserted with errors: ${err},`, req.user);
		return next(err);
	}

	logger.info('API', operationName, `location ${location._id} inserted`, req.user._id);
	logger.verbose('API', operationName, `location ${location} inserted`, req.user);
	res.status(200).json([location, result]);
};

/**
 * updates locations in db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.body = object with key : nuValue pairs,
 * also includes _id field for finding.
 *
 * @param {*} res http response. expected to return successfully updated locations as
 * a JSON object.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.updateMany = async (req, res, next) => {
	const operationName = 'location.controller:updateMany';
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
		result1 = await Location.bulkWrite(ops);
	} catch (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}

	try {
		result2 = await updatePatients(
			req.body,
			req.body.map(elem => {
				return {
					_id: elem._id,
					patients: elem.removedPatients
				};
			}), req.user);
	} catch (err) {
		logger.error('API', operationName, `${result1.nModified} locations updated with errors: ${err.message},`, req.user._id);
		logger.verbose('API', operationName, `${result1.nModified} locations ${JSON.stringify(ops)} updated with errors: ${err},`, req.user);
		return next(err);
	}

	logger.info('API', operationName, `${result1.nModified} locations updated`, req.user._id);
	logger.verbose('API', operationName, `${result1.nModified} locations ${JSON.stringify(ops)} updated`, req.user);
	res.status(200).json([result1, result2]);
};

/**
 * updates a location in db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.body = object with key : nuValue pairs,
 * and also (optional) removedPatients property with patients id's array.
 *
 * @param {*} res http response. expected to return successfully updated location as
 * a JSON object.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.updateOne = async (req, res, next) => {
	const operationName = 'location.controller:updateOne';
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

	let location, result = {
		nModified: 0
	};

	try {
		location = await Location.findByIdAndUpdate(
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

	if (location.patients.length || req.body.removedPatients) {
		try {
			result = await updatePatients({
				_id: req.params.id,
				name: location.name,
				country: location.country,
				patients: location.patients
			}, {
				_id: req.params.id,
				patients: req.body.removedPatients
			}, req.user);
		} catch (err) {
			logger.error('API', operationName, `location ${req.params.id} updated with errors: ${err.message},`, req.user._id);
			logger.verbose('API', operationName, `location ${location} updated with errors: ${err},`, req.user);
			return next(err);
		}
	}

	logger.info('API', operationName, `location ${req.params.id} updated`, req.user._id);
	logger.verbose('API', operationName, `location ${location} updated`, req.user);
	res.status(200).json([location, result]);
};

/**
 * deletes locations from db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.body = array of objects: { _id: String, patients: [String] }
 *
 * @param {*} res http response.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.deleteMany = async (req, res, next) => {
	const operationName = 'location.controller:deleteOne';
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
		result1 = await Location.deleteMany({
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
		result2 = await removeFromPatients(req.body, req.user);
	} catch (err) {
		logger.error('API', operationName, `${req.body.length} locations deleted with errors: ${err.message},`, req.user._id);
		logger.verbose('API', operationName, `${req.body.length} locations ${JSON.stringify(req.body)} deleted with errors: ${err},`, req.user);
		return next(err);
	}

	logger.info('API', operationName, `${req.body.length} locations deleted`, req.user._id);
	logger.verbose('API', operationName, `${req.body.length} locations ${JSON.stringify(req.body)} deleted`, req.user);
	res.status(200).json([result1, result2]);
};

/**
 * deletes a location from db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.body.patients - array of patients ids to remove location from.
 *
 * @param {*} res http response. expected to return a result object.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.deleteOne = async (req, res, next) => {
	const operationName = 'location.controller:deleteOne';

	let result1, result2 = {
		nModified: 0
	};

	try {
		result1 = await Location.deleteOne({
			_id: req.params.id
		});
	} catch (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}

	try {
		result2 = await removeFromPatients({
			_id: req.params.id,
			patients: req.body.patients
		}, req.user);
	} catch (err) {
		logger.error('API', operationName, `location ${req.params.id} deleted with errors: ${err.message},`, req.user._id);
		logger.error('API', operationName, `location ${req.params.id} deleted with errors: ${err},`, req.user);
		return next(err);
	}

	logger.info('API', operationName, `location ${req.params.id} deleted`, req.user._id);
	logger.verbose('API', operationName, `location ${req.params.id} deleted`, req.user);
	res.status(200).json([result1, result2]);
};

/**
 * adds location/s to patients.
 * if performing both remove and add, use updatePatients instead!
 * @param {any} addObj object or array of objects: { location: { _id, name, description }, patients: [string]}.
 * locations will be added to these patients.
 * @param {any} user user object.
 * @returns promise.
 */
function addToPatients(addObj, user) {
	return updatePatients(addObj, null, user);
}

/**
 * removes location/s from patients.
 * if performing both remove and add, use updatePatients instead!
 * @param {any} removeObj object or array of objects: { location: { _id, name, description }, patients: [string]}.
 * patient/s will be removed from these locations.
 * @param {any} user user object.
 * @returns promise.
 */
function removeFromPatients(removeObj, user) {
	return updatePatients(null, removeObj, user);
}

/**
 * updates patients' locations arrays.
 * @param {any} addObj object or array of objects: { location: { _id, name, description }, patients: [string]}.
 * location/s will be added to these patients.
 * @param {any} removeObj object or array of objects: { location: { _id, name, description }, patients: [string]}.
 * location/s will be removed from these patients.
 * @param {any} user user object.
 * @returns promise.
 */
function updatePatients(addObj, removeObj, user) {
	// const operationName = 'patient.controller:updatepatientlocations';

	/** used in bulkWrite. */
	const ops = [];

	const by = {
		_id: mongoose.Types.ObjectId(user._id),
		username: user.username
	};

	if (addObj) {
		addObj = pivotToPatients(addObj);
		addObj.forEach(element => {
			// update existing locations.
			element.locations.forEach(location => {
				ops.push({
					updateOne: {
						filter: {
							_id: element.patient,
							'locations._id': location._id
						},
						update: {
							$set: {
								'locations.$': {
									_id: location._id,
									name: location.name,
									country: location.country
								}
							}
						}
					}
				});
			});

			// add non existing locations.
			ops.push({
				updateOne: {
					filter: {
						_id: element.patient
					},
					update: {
						$addToSet: {
							locations: {
								$each: element.locations
							}
						},
						updatedBy: by
					}
				}
			});
		});
	}

	if (removeObj) {
		removeObj = pivotToPatients(removeObj);
		removeObj.forEach(element => {
			ops.push({
				updateOne: {
					filter: {
						_id: element.patient
					},
					update: {
						$pull: {
							locations: {
								'_id': {
									$in: element.locations.map(location => location._id)
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
			Patient.bulkWrite(ops, (err, result) => {
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
 * utility function used in updatePatients(...).
 * turns a location centered object or object array to patient centered array.
 * @param {any} locationsObj location centered object or object array.
 * @returns patient centered object array.
 */
function pivotToPatients(locationsObj) {
	const patients = [];
	locationsObj = Array.isArray(locationsObj) ? locationsObj : [locationsObj];

	locationsObj.map(location => {
		return {
			location: {
				_id: mongoose.Types.ObjectId(location._id),
				name: location.name,
				country: location.country
			},
			patients: location.patients || []
		};
	}).forEach(locationing => {
		locationing.patients.map(patient => mongoose.Types.ObjectId(patient._id || patient)).forEach(patientId => {
			const indexOf = patients.findIndex(e => e.patient.equals(patientId));
			if (indexOf === -1) {
				patients.push({
					patient: mongoose.Types.ObjectId(patientId),
					locations: [locationing.location]
				});
			} else {
				patients[indexOf].locations.push(locationing.location);
			}
		});
	});

	return patients;
}

/**
 * builds update object arrays for update queries.
 * @param {*} update object containing key : nuValue pairs.
 * tolerant to _id and removedPatients fields presence.
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
	delete update.removedPatients; // not an actual field.
	delete update._id; // not an actual change.

	Object.keys(update).forEach(key => updateObj[key] = update[key]);

	return updateObj;
}
