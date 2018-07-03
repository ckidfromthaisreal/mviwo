/*
patient controller.
*/

/** server config file. */
const config = require('../../server.json');

/** http://mongoosejs.com/
  mongoose provides a straight-forward, schema-based solution to model your application data.
  it includes built-in type casting, validation, query building, business logic hooks and more,
  out of the box.
*/
const mongoose = require('mongoose').set('debug', config.DEBUG_MONGOOSE);

/** patient model. */
const Patient = require('../../model/patient/patient.model');

/** location model. */
const Location = require('../../model/location/location.model');

/** custom-made logger module. */
const logger = require('../../util/logger');

/**
 * fetches patients from db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.headers.filter - filter object. if not provided, fetches all patients in db.
 *
 * req.headers.fields - specifies which fields should be included in returned patient.
 *
 * req.headers.locationsPopulate = if true, populates patient's locations array with location objects.
 *
 * req.headers.locationsSelect = specifies which fields should be included in returned location objects.
 * @param {*} res http response. expected to return patients as JSON object array.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.getMany = async (req, res, next) => {
	const operationName = 'patient.controller.js:getMany';
	logger.verbose('API', operationName, `req.headers${JSON.stringify(req.headers)}`);

	let query;
	if (req.headers.filter) {
		query = Patient.find(JSON.parse(req.headers.filter));
	} else {
		query = Patient.find();
	}

	if (req.headers.fields) {
		query.select(req.headers.fields);
	}

	if (req.headers.locationspopulate === 'true' &&
		(!req.headers.fields || req.headers.fields.includes('locations'))) {
		query.populate({
			path: 'locations._id',
			select: req.headers.locationsselect
		});
	}

	try {
		const patients = await query.exec();
		logger.info('API', operationName, `fetched ${patients.length} patients`);
		logger.verbose('API', operationName, `${patients.length} patients: ${JSON.stringify(patients)} fetched`, req.user);
		res.status(200).json(patients);
	} catch (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}
};

/**
 * fetches a patient from db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.headers.fields - specifies which fields should be included in returned patient.
 *
 * req.headers.locationsPopulate = if true, populates patient's locations array with location objects.
 *
 * req.headers.locationsSelect = specifies which fields should be included in returned location objects.
 * @param {*} res http response. expected to return the patient as JSON object.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.getOne = async (req, res, next) => {
	const operationName = 'patient.controller.js:getOne';
	const query = Patient.findById(req.params.id);

	if (req.headers.fields) {
		query.select(req.headers.fields);
	}

	if (req.headers.locationspopulate === 'true' &&
		(!req.headers.fields || req.headers.fields.includes('locations'))) {
		query.populate({
			path: 'locations._id',
			select: req.headers.locationsselect
		});
	}

	try {
		const patient = await query.exec();

		if (!patient) {
			const err = `patient ${req.params.id} not found`;
			logger.warn('API', operationName, err, req.user._id);
			logger.verbose('API', operationName, err, req.user);
			res.status(404).send(err);
		} else {
			logger.info('API', operationName, `patient ${req.params.id} fetched`, req.user._id);
			logger.verbose('API', operationName, `patient ${patient} fetched`, req.user);
			res.status(200).json(patient);
		}
	} catch (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}
};

/**
 * inserts new patients to db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.body = array of patient objects for insertion.
 *
 * @param {*} res http response. expected to return successfully inserted patients as
 * an array of JSON objects.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.insertMany = async (req, res, next) => {
	const operationName = 'patient.controller:insertMany';
	let err;

	if (!req.body || !req.body.length) {
		err = new Error('invalid input: no resources');
	}

	if (err) {
		logger.error('API', operationName, err, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}

	let patients, result;

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
		patients = await Patient.insertMany(insertObjs);
	} catch (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}

	try {
		result = await addToLocations(patients, req.user);
	} catch (err) {
		logger.error('API', operationName, `${patients.length} patients inserted with errors: ${err.message},`, req.user._id);
		logger.verbose('API', operationName, `${patients.length} patients ${JSON.stringify(patients)} inserted with errors: ${err},`, req.user);
		return next(err);
	}

	logger.info('API', operationName, `${patients.length} patients inserted`, req.user._id);
	logger.verbose('API', operationName, `${patients.length} patients ${JSON.stringify(patients)} inserted`, req.user);
	res.status(200).json([patients, result]);
};

/**
 * inserts a new patient to db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.body = patient object for insertion.
 *
 * @param {*} res http response. expected to return successfully inserted patient as
 * a JSON object.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.insertOne = async (req, res, next) => {
	const operationName = 'patient.controller:insertOne';
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

	let patient, result;

	const userObj = {
		_id: mongoose.Types.ObjectId(req.user._id),
		username: req.user.username
	};

	const insertObj = req.body;
	insertObj.createdBy = userObj;
	insertObj.updatedBy = userObj;

	try {
		patient = await Patient.create(insertObj);
	} catch (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}

	try {
		result = await addToLocations(patient, req.user);
	} catch (err) {
		logger.error('API', operationName, `patient ${patient._id} inserted with errors: ${err.message},`, req.user._id);
		logger.verbose('API', operationName, `patient ${patient} inserted with errors: ${err},`, req.user);
		return next(err);
	}

	logger.info('API', operationName, `patient ${patient._id} inserted`, req.user._id);
	logger.verbose('API', operationName, `patient ${patient} inserted`, req.user);
	res.status(200).json([patient, result]);
};

/**
 * updates patients in db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.body = object with key : nuValue pairs,
 * also includes _id field for finding.
 *
 * @param {*} res http response. expected to return successfully updated patients as
 * a JSON object.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.updateMany = async (req, res, next) => {
	const operationName = 'patient.controller:updateMany';
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
		result1 = await Patient.bulkWrite(ops);
	} catch (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}

	try {
		result2 = await updateLocations(
			req.body,
			req.body.map(elem => {
				return {
					_id: elem._id,
					locations: elem.removedLocations
				};
			}), req.user);
	} catch (err) {
		logger.error('API', operationName, `${result1.nModified} patients updated with errors: ${err.message},`, req.user._id);
		logger.verbose('API', operationName, `${result1.nModified} patients ${JSON.stringify(ops)} updated with errors: ${err},`, req.user);
		return next(err);
	}

	logger.info('API', operationName, `${result1.nModified} patients updated`, req.user._id);
	logger.verbose('API', operationName, `${result1.nModified} patients ${JSON.stringify(ops)} updated`, req.user);
	res.status(200).json([result1, result2]);
};

/**
 * updates a patient in db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.body = object with key : nuValue pairs,
 * and also (optional) removedLocations property with locations id's array.
 *
 * @param {*} res http response. expected to return successfully updated patient as
 * a JSON object.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.updateOne = async (req, res, next) => {
	const operationName = 'patient.controller:updateOne';
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

	let patient, result = {
		nModified: 0
	};

	try {
		patient = await Patient.findByIdAndUpdate(
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

	if (patient.locations.length || req.body.removedLocations) {
		try {
			result = await updateLocations({
				_id: req.params.id,
				uid: patient.uid,
				firstName: patient.firstName,
				lastName: patient.lastName,
				dateOfBirth: patient.dateOfBirth,
				isFemale: patient.isFemale,
				locations: patient.locations
			}, {
				_id: req.params.id,
				locations: req.body.removedLocations
			}, req.user);
		} catch (err) {
			logger.error('API', operationName, `patient ${req.params.id} updated with errors: ${err.message},`, req.user._id);
			logger.verbose('API', operationName, `patient ${patient} updated with errors: ${err},`, req.user);
			return next(err);
		}
	}

	logger.info('API', operationName, `patient ${req.params.id} updated`, req.user._id);
	logger.verbose('API', operationName, `patient ${patient} updated`, req.user);
	res.status(200).json([patient, result]);
};

/**
 * deletes patients from db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.body = array of objects: { _id: String, locations: [String] }
 *
 * @param {*} res http response.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.deleteMany = async (req, res, next) => {
	const operationName = 'patient.controller:deleteOne';
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
		result1 = await Patient.deleteMany({
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
		result2 = await removeFromLocations(req.body, req.user);
	} catch (err) {
		logger.error('API', operationName, `${req.body.length} patients deleted with errors: ${err.message},`, req.user._id);
		logger.verbose('API', operationName, `${req.body.length} patients ${JSON.stringify(req.body)} deleted with errors: ${err},`, req.user);
		return next(err);
	}

	logger.info('API', operationName, `${req.body.length} patients deleted`, req.user._id);
	logger.verbose('API', operationName, `${req.body.length} patients ${JSON.stringify(req.body)} deleted`, req.user);
	res.status(200).json([result1, result2]);
};

/**
 * deletes a patient from db.
 * @param {*} req http request.
 *
 * req.user - object including user credentials.
 *
 * req.body.locations - array of locations ids to remove patient from.
 *
 * @param {*} res http response. expected to return a result object.
 * @param {*} next callback used to pass errors (or requests) to next handlers.
 */
exports.deleteOne = async (req, res, next) => {
	const operationName = 'patient.controller:deleteOne';

	let result1, result2 = {
		nModified: 0
	};

	try {
		result1 = await Patient.deleteOne({
			_id: req.params.id
		});
	} catch (err) {
		logger.error('API', operationName, err.message, req.user._id);
		logger.verbose('API', operationName, err, req.user);
		return next(err);
	}

	try {
		result2 = await removeFromLocations({
			_id: req.params.id,
			locations: req.body.locations
		}, req.user);
	} catch (err) {
		logger.error('API', operationName, `patient ${req.params.id} deleted with errors: ${err.message},`, req.user._id);
		logger.error('API', operationName, `patient ${req.params.id} deleted with errors: ${err},`, req.user);
		return next(err);
	}

	logger.info('API', operationName, `patient ${req.params.id} deleted`, req.user._id);
	logger.verbose('API', operationName, `patient ${req.params.id} deleted`, req.user);
	res.status(200).json([result1, result2]);
};

/**
 * adds patient/s to locations.
 * if performing both remove and add, use updateLocations instead!
 * @param {any} addObj object or array of objects: { patient: { _id, name, description }, locations: [string]}.
 * patients will be added to these locations.
 * @param {any} user user object.
 * @returns promise.
 */
function addToLocations(addObj, user) {
	return updateLocations(addObj, null, user);
}

/**
 * removes patient/s from locations.
 * if performing both remove and add, use updateLocations instead!
 * @param {any} removeObj object or array of objects: { patient: { _id, name, description }, locations: [string]}.
 * location/s will be removed from these patients.
 * @param {any} user user object.
 * @returns promise.
 */
function removeFromLocations(removeObj, user) {
	return updateLocations(null, removeObj, user);
}

/**
 * updates locations' patients arrays.
 * @param {any} addObj object or array of objects: { patient: { _id, name, description }, locations: [string]}.
 * patient/s will be added to these locations.
 * @param {any} removeObj object or array of objects: { patient: { _id, name, description }, locations: [string]}.
 * patient/s will be removed from these locations.
 * @param {any} user user object.
 * @returns promise.
 */
function updateLocations(addObj, removeObj, user) {
	// const operationName = 'location.controller:updatelocationpatients';

	/** used in bulkWrite. */
	const ops = [];

	const by = {
		_id: mongoose.Types.ObjectId(user._id),
		username: user.username
	};

	if (addObj) {
		addObj = pivotToLocations(addObj);
		addObj.forEach(element => {
			// update existing patients.
			element.patients.forEach(patient => {
				ops.push({
					updateOne: {
						filter: {
							_id: element.location,
							'patients._id': patient._id
						},
						update: {
							$set: {
								'patients.$': {
									_id: patient._id,
									uid: patient.uid,
									firstName: patient.firstName,
									lastName: patient.lastName,
									dateOfBirth: patient.dateOfBirth,
									isFemale: patient.isFemale
								}
							}
						}
					}
				});
			});

			// add non existing patients.
			ops.push({
				updateOne: {
					filter: {
						_id: element.location
					},
					update: {
						$addToSet: {
							patients: {
								$each: element.patients
							}
						},
						updatedBy: by
					}
				}
			});
		});
	}

	if (removeObj) {
		removeObj = pivotToLocations(removeObj);
		removeObj.forEach(element => {
			ops.push({
				updateOne: {
					filter: {
						_id: element.location
					},
					update: {
						$pull: {
							patients: {
								'_id': {
									$in: element.patients.map(patient => patient._id)
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
			Location.bulkWrite(ops, (err, result) => {
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
 * utility function used in updateLocations(...).
 * turns a patient centered object or object array to location centered array.
 * @param {any} patientsObj patient centered object or object array.
 * @returns location centered object array.
 */
function pivotToLocations(patientsObj) {
	const locations = [];
	patientsObj = Array.isArray(patientsObj) ? patientsObj : [patientsObj];

	patientsObj.map(patient => {
		return {
			patient: {
				_id: mongoose.Types.ObjectId(patient._id),
				uid: patient.uid,
				firstName: patient.firstName,
				lastName: patient.lastName,
				dateOfBirth: patient.dateOfBirth,
				isFemale: patient.isFemale
			},
			locations: patient.locations || []
		};
	}).forEach(patienting => {
		patienting.locations.map(location => mongoose.Types.ObjectId(location._id || location)).forEach(locationId => {
			const indexOf = locations.findIndex(e => e.location.equals(locationId));
			if (indexOf === -1) {
				locations.push({
					location: mongoose.Types.ObjectId(locationId),
					patients: [patienting.patient]
				});
			} else {
				locations[indexOf].patients.push(patienting.patient);
			}
		});
	});

	return locations;
}

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
	delete update.removedLocations; // not an actual field.
	delete update._id; // not an actual change.

	Object.keys(update).forEach(key => updateObj[key] = update[key]);

	return updateObj;
}
