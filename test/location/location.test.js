/*
testing module for location.controller.js
*/

/** http://www.chaijs.com/
 * chai is a BDD/TDD assertion library for node and the browser that can be
 * delightfully paired with any javascript testing framework. chai has several
 * interfaces that allow the developer to choose the most comfortable.
 */
const expect = require('chai').expect;

/** general use module for running axios requests. */
const axios = require('../axios-runner');

/** https://github.com/node-nock/nock
 * nock is an HTTP mocking and expectations library for node.js.
 * nock can be used to test modules that peform HTTP requests in isolation.
 * for instance, if a module performs HTTP requests to a couchdb server or
 * makes HTTP requests to the amazon API, you can test that module in isolation.
 */
// const nock = require('nock');

/** location api url. */
const url = 'http://localhost:4200/api/location';

const patients = [];

describe('location.controller.js', () => {
	let locations = [];

	let tokenObj;

	before(async () => {
		tokenObj = await axios.insertMany('http://localhost:4200/api/user/login', {
			login: 'superuser',
			password: require('../../server/secret').superpassword
		});

		for (let i = 0; i < 3; i++) {
			let patient = {
				firstName: `fn00${i}`,
				lastName: `ln00${i}`,
				isFemale: i % 2 == 0,
				locations: []
			};

			const res = await axios.insertOne('http://localhost:4200/api/patient', patient, {
				headers: {
					Authorization: `Bearer ${tokenObj.token}`
				}
			});
			patient._id = res[0]._id;
			patient.uid = res[0].uid;

			patients.push(patient);
		}
	});

	after(() => {
		return axios.deleteMany('http://localhost:4200/api/patient', {
			headers: {
				Authorization: `Bearer ${tokenObj.token}`
			},
			data: patients.map(patient => {
				return {
					_id: patient._id,
					locations: patient.locations
				};
			})
		});
	});

	it('insertMany', () => {
		const num = 2;
		const tempLocations = generateLocations(num);
		return axios.insertMany(url, tempLocations, {
			headers: {
				Authorization: `Bearer ${tokenObj.token}`
			}
		}).then(response => {
			expect(response).to.be.an('array');
			expect(response).to.have.lengthOf(2);
			expect(response[0]).to.be.an('array');
			expect(response[0]).to.have.lengthOf(num);
			response[0].forEach((loc, i) => {
				expect(loc).to.be.an('object');
				Object.keys(tempLocations[i]).forEach(key => {
					if (!(loc[key] instanceof Object) && !(loc[key] instanceof Array)) {
						expect(tempLocations[i][key]).to.be.equal(loc[key]);
					}
				});

				expect(loc).to.haveOwnProperty('patients');
				expect(loc.patients).to.be.an('array');
				expect(loc.patients).to.be.lengthOf(tempLocations[i].patients.length);
				loc.patients.forEach((patient, j) => {
					expect(tempLocations[i].patients.map(pat => pat._id)).to.include(patient._id);
					expect(patient).to.be.an('object');
					expect(patient).to.haveOwnProperty('uid');
					expect(patient.uid).to.be.equal(tempLocations[i].patients[j].uid);
					expect(patient).to.haveOwnProperty('firstName');
					expect(patient.firstName).to.be.equal(tempLocations[i].patients[j].firstName);
					expect(patient).to.haveOwnProperty('lastName');
					expect(patient.lastName).to.be.equal(tempLocations[i].patients[j].lastName);
					expect(patient).to.haveOwnProperty('isFemale');
					expect(patient.isFemale).to.be.equal(tempLocations[i].patients[j].isFemale);
					if (tempLocations[i].patients[j].dateOfBirth) {
						expect(patient).to.haveOwnProperty('dateOfBirth');
						expect(patient.dateOfBirth).to.be.equal(tempLocations[i].patients[j].dateOfBirth);
					}
				});
			});
			expect(response[1]).to.be.an('object');
			expect(response[1]).to.haveOwnProperty('nModified');
			expect(response[1].nModified).to.be.equal(uniquePatients(tempLocations));

			return axios.getMany('http://localhost:4200/api/patient', {
				headers: {
					Authorization: `Bearer ${tokenObj.token}`
				}
			}).then(response2 => {
				response[0].forEach(location => {
					response2.forEach(patient => {
						if (location.patients.map(pat => pat._id).includes(patient)) {
							const ind = patient.locations.map(loc => loc._id).indexOf(location._id);
							expect(ind).to.be.greaterThan(-1);
							expect(patient.locations[ind]).to.be.an('object');
							expect(patient.locations[ind]).to.haveOwnProperty('name');
							expect(patient.locations[ind].name).to.be.equal(location.name);
							expect(patient.locations[ind]).to.haveOwnProperty('country');
							expect(patient.locations[ind].country).to.be.equal(location.country);
						}
					});
				});
			}).then(() => locations = [...locations, ...response[0]]);
		});
	});

	it('getMany', () => {
		return axios.getMany(url, {
			headers: {
				Authorization: `Bearer ${tokenObj.token}`,
			}
		}).then(response => {
			expect(response).to.be.an('array');
			response.forEach((location, i) => {
				expect(location).to.be.an('object');
				expect(location).to.haveOwnProperty('_id');
				if (locations.map(pat => pat._id).includes(location._id)) {
					expect(location).to.haveOwnProperty('patients');
					expect(location.patients).to.be.an('array');
					expect(location.patients).to.have.lengthOf(locations[i].patients.length);
					location.patients.forEach(patient => {
						expect(patient).to.be.an('object');
						expect(patient).to.haveOwnProperty('_id');
						const ind = patients.map(pat => pat._id).indexOf(patient._id);
						expect(ind).to.be.greaterThan(-1);
						expect(patient).to.haveOwnProperty('uid');
						expect(patient.uid).to.be.equal(patients[ind].uid);
						expect(patient).to.haveOwnProperty('firstName');
						expect(patient.firstName).to.be.equal(patients[ind].firstName);
						expect(patient).to.haveOwnProperty('lastName');
						expect(patient.lastName).to.be.equal(patients[ind].lastName);
						expect(patient).to.haveOwnProperty('isFemale');
						expect(patient.isFemale).to.be.equal(patients[ind].isFemale);
						if (patients[ind].dateOfBirth) {
							expect(patient).to.haveOwnProperty('dateOfBirth');
							expect(patient.dateOfBirth).to.be.equal(patients[ind].dateOfBirth);
						}
					});
				}
			});
		});
	});

	it('updateMany', () => {
		const changes = updateLocations(locations);
		return axios.updateMany(url, changes, {
			headers: {
				Authorization: `Bearer ${tokenObj.token}`
			}
		}).then(response => {
			expect(response).to.be.an('array');
			expect(response).to.have.lengthOf(2);
			expect(response[0]).to.be.an('object');
			expect(response[0]).to.haveOwnProperty('nModified');
			expect(response[0].nModified).to.be.equal(changes.length);
			expect(response[1]).to.be.an('object');
			expect(response[1]).to.haveOwnProperty('nModified');
			expect(response[1].nModified).to.be.equal(uniquePatients(changes,
				changes.map(change => change.removedPatients)));

			axios.getMany('http://localhost:4200/api/location', {
				headers: {
					Authorization: `Bearer ${tokenObj.token}`,
				}
			}).then(response2 => {
				locations.forEach(location => {
					response2.forEach(patient => {
						if (location.patients.map(pat => pat._id).includes(patient._id)) {
							const ind = patient.locations.map(loc => loc._id).indexOf(location._id);
							expect(ind).to.be.greaterThan(-1);
							expect(patient.locations[ind]).to.be.an('object');
							expect(patient.locations[ind]).to.haveOwnProperty('name');
							expect(patient.locations[ind].name).to.be.equal(location.name);
							expect(patient.locations[ind]).to.haveOwnProperty('country');
							expect(patient.locations[ind].country).to.be.equal(location.country);
						}
					});
				});
			});
		});
	});

	it('deleteMany', () => {
		return axios.deleteMany(url, {
			data: locations,
			headers: {
				Authorization: `Bearer ${tokenObj.token}`
			}
		}).then(response => {
			expect(response).to.be.an('array');
			expect(response).to.have.lengthOf(2);
			expect(response[0]).to.be.an('object');
			expect(response[0]).to.haveOwnProperty('n');
			expect(response[0].n).to.be.equal(locations.length);
			expect(response[1]).to.be.an('object');
			expect(response[1]).to.haveOwnProperty('nModified');
			expect(response[1].nModified).to.be.equal(uniquePatients(locations));

			axios.getMany('http://localhost:4200/api/patient', {
				headers: {
					Authorization: `Bearer ${tokenObj.token}`
				}
			}).then(response2 => {
				locations.forEach(location => {
					response2.forEach(patient => {
						if (location.patients.map(pat => pat._id).includes(patient)) {
							expect(patient.locations.map(loc => loc._id)).to.not.include(location._id);
						}
					});
				});
			});

			locations = [];
		});
	});

	it('insertOne', () => {
		const location = generateLocations(1)[0];
		return axios.insertOne(url, location, {
			headers: {
				Authorization: `Bearer ${tokenObj.token}`
			}
		}).then(response => {
			expect(response).to.be.an('array');
			expect(response).to.have.lengthOf(2);
			expect(response[0]).to.be.an('object');
			expect(response[0]).to.haveOwnProperty('name');
			expect(response[0].name).to.be.equal(location.name);
			expect(response[0]).to.haveOwnProperty('country');
			expect(response[0].country).to.be.equal(location.country);
			expect(response[0]).to.haveOwnProperty('patients');
			expect(response[0].patients).to.be.an('array');
			expect(response[0].patients).to.have.lengthOf(location.patients.length);
			response[0].patients.forEach(patient => {
				expect(patient).to.be.an('object');
				expect(patient).to.haveOwnProperty('_id');
				const ind = location.patients.map(pat => pat._id).indexOf(patient._id);
				expect(ind).to.be.greaterThan(-1);
				expect(patient).to.haveOwnProperty('uid');
				expect(patient.uid).to.be.equal(location.patients[ind].uid);
				expect(patient).to.haveOwnProperty('firstName');
				expect(patient.firstName).to.be.equal(location.patients[ind].firstName);
				expect(patient).to.haveOwnProperty('lastName');
				expect(patient.lastName).to.be.equal(location.patients[ind].lastName);
				expect(patient).to.haveOwnProperty('isFemale');
				expect(patient.isFemale).to.be.equal(location.patients[ind].isFemale);
				if (location.patients[ind].dateOfBirth) {
					expect(patient).to.haveOwnProperty('dateOfBirth');
					expect(patient.dateOfBirth).to.be.equal(location.patients[ind].dateOfBirth);
				}
			});
			expect(response[1]).to.be.an('object');
			expect(response[1]).to.haveOwnProperty('nModified');
			expect(response[1].nModified).to.be.equal(location.patients.length);

			return axios.getMany('http://localhost:4200/api/patient', {
				headers: {
					Authorization: `Bearer ${tokenObj.token}`
				}
			}).then(response2 => {
				response2.forEach(patient => {
					if (location.patients.map(pat => pat._id).includes(patient)) {
						const ind = patient.locations.map(loc => loc._id).indexOf(location._id);
						expect(ind).to.be.greaterThan(-1);
						expect(patient.locations[ind]).to.be.an('object');
						expect(patient.locations[ind]).to.haveOwnProperty('name');
						expect(patient.locations[ind].name).to.be.equal(location.name);
						expect(patient.locations[ind]).to.haveOwnProperty('country');
						expect(patient.locations[ind].country).to.be.equal(location.country);
					}
				});
			}).then(() => locations = [response[0]]);


		});
	});

	it('getOne', () => {
		return axios.getOne(url, locations[0]._id, {
			headers: {
				Authorization: `Bearer ${tokenObj.token}`,
			}
		}).then(response => {
			expect(response).to.be.an('object');
			expect(response).to.haveOwnProperty('_id');
			expect(response._id).to.be.equal(locations[0]._id);
			expect(response).to.haveOwnProperty('name');
			expect(response.name).to.be.equal(locations[0].name);
			expect(response).to.haveOwnProperty('country');
			expect(response.country).to.be.equal(locations[0].country);
			expect(response).to.haveOwnProperty('patients');
			response.patients.forEach(patient => {
				expect(patient).to.be.an('object');
				expect(patient).to.haveOwnProperty('_id');
				const ind = locations[0].patients.map(pat => pat._id).indexOf(patient._id);
				expect(ind).to.be.greaterThan(-1);
				expect(patient).to.haveOwnProperty('uid');
				expect(patient.uid).to.be.equal(locations[0].patients[ind].uid);
				expect(patient).to.haveOwnProperty('firstName');
				expect(patient.firstName).to.be.equal(locations[0].patients[ind].firstName);
				expect(patient).to.haveOwnProperty('lastName');
				expect(patient.lastName).to.be.equal(locations[0].patients[ind].lastName);
				expect(patient).to.haveOwnProperty('isFemale');
				expect(patient.isFemale).to.be.equal(locations[0].patients[ind].isFemale);
				if (locations[0].patients[ind].dateOfBirth) {
					expect(patient).to.haveOwnProperty('dateOfBirth');
					expect(patient.dateOfBirth).to.be.equal(locations[0].patients[ind].dateOfBirth);
				}
			});
		});
	});

	it('updateOne', () => {
		const changes = updateLocations(locations);
		return axios.updateOne(url, locations[0]._id, changes[0], {
			headers: {
				Authorization: `Bearer ${tokenObj.token}`
			}
		}).then(response => {
			expect(response).to.be.an('array');
			expect(response).to.have.lengthOf(2);
			expect(response[0]).to.be.an('object');
			expect(response[0]).to.haveOwnProperty('name');
			expect(response[0].name).to.be.equal(changes[0].name);
			expect(response[0]).to.haveOwnProperty('country');
			expect(response[0].country).to.be.equal(changes[0].country);
			expect(response[0]).to.haveOwnProperty('patients');
			expect(response[0].patients).to.be.an('array');
			expect(response[0].patients).to.have.lengthOf(changes[0].patients.length);
			changes[0].patients.forEach((patient, i) => {
				expect(response[0].patients[i]).to.be.an('object');
				Object.keys(patients[i]).forEach(key => {
					if (!(patients[i][key] instanceof Array) && !(patients[i][key] instanceof Object)) {
						expect(response[0].patients[i]).to.haveOwnProperty(key);
						expect(response[0].patients[i][key]).to.be.equal(patient[key]);
					}
				});
			});
			expect(response[1]).to.be.an('object');
			expect(response[1]).to.haveOwnProperty('nModified');
			expect(response[1].nModified).to.be.equal(uniquePatients(locations,
				changes.map(change => change.removedPatients)));

			return axios.getMany('http://localhost:4200/api/patient', {
				headers: {
					Authorization: `Bearer ${tokenObj.token}`,
				}
			}).then(response2 => {
				response2.forEach(patient => {
					expect(patient).to.be.an('object');
					expect(patient).to.haveOwnProperty('_id');
					if (locations[0].patients.map(pat => pat._id).includes(patient._id)) {
						expect(patient).to.haveOwnProperty('locations');
						const ind = patient.locations.map(loc => loc._id).indexOf(locations[0]._id);
						expect(ind).to.be.greaterThan(-1);
						expect(patient.locations[ind]).to.be.an('object');
						expect(patient.locations[ind]).to.haveOwnProperty('name');
						expect(patient.locations[ind].name).to.be.equal(locations[0].name);
						expect(patient.locations[ind]).to.haveOwnProperty('country');
						expect(patient.locations[ind].country).to.be.equal(locations[0].country);
					}
				});
			});
		});
	});

	it('deleteOne', () => {
		return axios.deleteOne(url, locations[0]._id, {
			data: {
				patients: locations[0].patients,
			},
			headers: {
				Authorization: `Bearer ${tokenObj.token}`
			}
		}).then(response => {
			expect(response).to.be.an('array');
			expect(response).to.have.lengthOf(2);
			expect(response[0]).to.be.an('object');
			expect(response[1]).to.be.an('object');
			expect(response[1]).to.haveOwnProperty('nModified');
			expect(response[1].nModified).to.be.equal(locations[0].patients.length);

			axios.getMany('http://localhost:4200/api/location', {
				headers: {
					Authorization: `Bearer ${tokenObj.token}`,
				}
			}).then(response2 => {
				response2.forEach(patient => {
					if (locations[0].patients.map(pat => pat._id).includes(patient._id)) {
						expect(patient.locations.map(loc => loc._id)).to.not.include(locations[0]._id);
					}
				});
			});

			locations.pop();
		});
	});
});

/**
 * generates locations stub for tests.
 * @param {*} num num of locations to generate.
 */
function generateLocations(num) {
	if (num <= 0) {
		throw new Error('num must be positive!');
	}

	const locations = [];

	for (let i = 0; i < num; i++) {
		locations.push({
			name: `test${i}`,
			country: 'USA',
			patients: [{
				_id: patients[0]._id,
				uid: patients[0].uid,
				firstName: patients[0].firstName,
				lastName: patients[0].lastName,
				isFemale: patients[0].isFemale,
				dateOfBirth: patients[0].dateOfBirth
			}, {
				_id: patients[2]._id,
				uid: patients[2].uid,
				firstName: patients[2].firstName,
				lastName: patients[2].lastName,
				isFemale: patients[2].isFemale,
				dateOfBirth: patients[2].dateOfBirth
			}]
		});
	}

	return locations;
}

function uniquePatients(locations, removedPatients) {
	let count = 0;

	let uniques = {};
	locations.forEach(location => {
		location.patients.map(patient => patient._id).forEach(id => {
			uniques[id] = true;
		});
	});

	count += Object.keys(uniques).length;

	uniques = {};
	if (removedPatients) {
		removedPatients.forEach(elem => {
			if (Array.isArray(elem)) {
				elem.forEach(id => {
					uniques[id] = true;
				});
			} else {
				uniques[elem] = true;
			}
		});
	}

	count += Object.keys(uniques).length;

	return count;
}

/**
 * updates all patients.
 * @returns changes array.
 */
function updateLocations(locations) {
	const changes = [];

	locations[0].name += ' updated';
	locations[0].patients = [{
		_id: patients[1]._id,
		uid: patients[1].uid,
		firstName: patients[1].firstName,
		lastName: patients[1].lastName,
		isFemale: patients[1].isFemale,
		dateOfBirth: patients[1].dateOfBirth
	}];

	if (locations.length > 1) {
		locations[1].country = 'ISR';
		locations[1].patients.push({
			_id: patients[1]._id,
			uid: patients[1].uid,
			firstName: patients[1].firstName,
			lastName: patients[1].lastName,
			isFemale: patients[1].isFemale,
			dateOfBirth: patients[1].dateOfBirth
		});
	}

	locations.forEach(location => {
		changes.push({
			_id: location._id,
			name: location.name,
			country: location.country,
			patients: location.patients
		});
	});

	changes[0].removedPatients = [patients[0]._id, patients[2]._id];

	if (locations.length > 1) {
		changes[1].removedPatients = [];
	}

	return changes;
}
