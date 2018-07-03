/*
testing module for patient.controller.js
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

/** patient api url. */
const url = 'http://localhost:4200/api/patient';

const locations = [];

describe('patient.controller.js', () => {
	let patients = [];

	let tokenObj;

	before(async () => {
		tokenObj = await axios.insertMany('http://localhost:4200/api/user/login', {
			login: 'superuser',
			password: require('../../server/secret').superpassword
		});

		for (let i = 0; i < 3; i++) {
			let location = {
				name: `test00${i}`,
				country: 'USA',
				patients: []
			};

			const res = await axios.insertOne('http://localhost:4200/api/location', location, {
				headers: {
					Authorization: `Bearer ${tokenObj.token}`
				}
			});
			location._id = res[0]._id;

			locations.push(location);
		}
	});

	after(() => {
		axios.deleteMany('http://localhost:4200/api/location', {
			headers: {
				Authorization: `Bearer ${tokenObj.token}`
			},
			data: locations.map(location => {
				return {
					_id: location._id,
					patients: location.patients
				};
			})
		});
	});

	it('insertMany', () => {
		const num = 2;
		const tempPatients = generatePatients(num);
		return axios.insertMany(url, tempPatients, {
			headers: {
				Authorization: `Bearer ${tokenObj.token}`
			}
		}).then(response => {
			expect(response).to.be.an('array');
			expect(response).to.have.lengthOf(2);
			expect(response[0]).to.be.an('array');
			expect(response[0]).to.have.lengthOf(num);
			response[0].forEach((pat, i) => {
				expect(pat).to.be.an('object');
				expect(pat).to.haveOwnProperty('uid');
				Object.keys(tempPatients[i]).forEach(key => {
					if (!(pat[key] instanceof Object) && !(pat[key] instanceof Array)) {
						expect(tempPatients[i][key]).to.be.equal(pat[key]);
					}
				});

				expect(pat).to.haveOwnProperty('locations');
				expect(pat.locations).to.be.an('array');
				expect(pat.locations).to.be.lengthOf(tempPatients[i].locations.length);
				pat.locations.forEach((location, j) => {
					expect(tempPatients[i].locations.map(loc => loc._id)).to.include(location._id);
					expect(location).to.be.an('object');
					expect(location).to.haveOwnProperty('name');
					expect(location.name).to.be.equal(tempPatients[i].locations[j].name);
					expect(location).to.haveOwnProperty('country');
					expect(location.country).to.be.equal(tempPatients[i].locations[j].country);
				});
			});
			expect(response[1]).to.be.an('object');
			expect(response[1]).to.haveOwnProperty('nModified');
			expect(response[1].nModified).to.be.equal(uniqueLocations(tempPatients));

			return axios.getMany('http://localhost:4200/api/location', {
				headers: {
					Authorization: `Bearer ${tokenObj.token}`
				}
			}).then(response2 => {
				response[0].forEach(patient => {
					response2.forEach(location => {
						if (patient.locations.map(loc => loc._id).includes(location)) {
							const ind = location.patients.map(pat => pat._id).indexOf(patient._id);
							expect(ind).to.be.greaterThan(-1);
							expect(location.patients[ind]).to.be.an('object');
							expect(location.patients[ind]).to.haveOwnProperty('uid');
							expect(location.patients[ind].uid).to.be.equal(patient.uid);
							expect(location.patients[ind]).to.haveOwnProperty('firstName');
							expect(location.patients[ind].firstName).to.be.equal(patient.firstName);
							expect(location.patients[ind]).to.haveOwnProperty('lastName');
							expect(location.patients[ind].lastName).to.be.equal(patient.lastName);
							expect(location.patients[ind]).to.haveOwnProperty('isFemale');
							expect(location.patients[ind].isFemale).to.be.equal(patient.isFemale);
							if (patient.dateOfBirth) {
								expect(location.patients[ind]).to.haveOwnProperty('dateOfBirth');
								expect(location.patients[ind].dateOfBirth).to.be.equal(patient.dateOfBirth);
							}
						}
					});
				});
			}).then(() => { patients = [...patients, ...response[0]]; });
		});

	});

	it('getMany', () => {
		return axios.getMany(url, {
			headers: {
				Authorization: `Bearer ${tokenObj.token}`,
			}
		}).then(response => {
			expect(response).to.be.an('array');
			response.forEach((patient, i) => {
				expect(patient).to.be.an('object');
				expect(patient).to.haveOwnProperty('_id');
				if (patients.map(loc => loc._id).includes(patient._id)) {
					expect(patient).to.haveOwnProperty('locations');
					expect(patient.locations).to.be.an('array');
					expect(patient.locations).to.have.lengthOf(patients[i].locations.length);
					patient.locations.forEach(location => {
						const ind = locations.map(loc => loc._id).indexOf(location._id);
						expect(ind).to.be.greaterThan(-1);
						expect(location).to.be.an('object');
						expect(location).to.haveOwnProperty('_id');
						expect(location._id).to.be.equal(locations[ind]._id);
						expect(location).to.haveOwnProperty('name');
						expect(location.name).to.be.equal(locations[ind].name);
						expect(location).to.haveOwnProperty('country');
						expect(location.country).to.be.equal(locations[ind].country);
					});
				}
			});
		});
	});

	it('updateMany', () => {
		const changes = updatePatients(patients);
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
			expect(response[1].nModified).to.be.equal(uniqueLocations(changes,
				changes.map(change => change.removedLocations)));

			return axios.getMany('http://localhost:4200/api/patient', {
				headers: {
					Authorization: `Bearer ${tokenObj.token}`,
				}
			}).then(response2 => {
				patients.forEach(patient => {
					response2.forEach(location => {
						if (patient.locations.map(loc => loc._id).includes(location._id)) {
							const ind = location.patients.map(pat => pat._id).indexOf(patient._id);
							expect(ind).to.be.greaterThan(-1);
							expect(location.patients[ind]).to.be.an('object');
							expect(location.patients[ind]).to.haveOwnProperty('uid');
							expect(location.patients[ind].uid).to.be.equal(patient.uid);
							expect(location.patients[ind]).to.haveOwnProperty('firstName');
							expect(location.patients[ind].firstName).to.be.equal(patient.firstName);
							expect(location.patients[ind]).to.haveOwnProperty('lastName');
							expect(location.patients[ind].lastName).to.be.equal(patient.lastName);
							expect(location.patients[ind]).to.haveOwnProperty('isFemale');
							expect(location.patients[ind].isFemale).to.be.equal(patient.isFemale);
							if (patient.dateOfBirth) {
								expect(location.patients[ind]).to.haveOwnProperty('dateOfBirth');
								expect(location.patients[ind].dateOfBirth).to.be.equal(patient.dateOfBirth);
							}
						}
					});
				});
			});
		});
	});

	it('deleteMany', () => {
		return axios.deleteMany(url, {
			data: patients,
			headers: {
				Authorization: `Bearer ${tokenObj.token}`
			}
		}).then(response => {
			expect(response).to.be.an('array');
			expect(response).to.have.lengthOf(2);
			expect(response[0]).to.be.an('object');
			expect(response[0]).to.haveOwnProperty('n');
			expect(response[0].n).to.be.equal(patients.length);
			expect(response[1]).to.be.an('object');
			expect(response[1]).to.haveOwnProperty('nModified');
			expect(response[1].nModified).to.be.equal(uniqueLocations(patients));

			return axios.getMany('http://localhost:4200/api/location', {
				headers: {
					Authorization: `Bearer ${tokenObj.token}`
				}
			}).then(response2 => {
				patients.forEach(patient => {
					response2.forEach(location => {
						if (patient.locations.map(loc => loc._id).includes(location)) {
							expect(location.patients.map(pat => pat._id)).to.not.include(patient._id);
						}
					});
				});
			}).then(() => patients = []);
		});
	});

	it('insertOne', () => {
		const patient = generatePatients(1)[0];
		return axios.insertOne(url, patient, {
			headers: {
				Authorization: `Bearer ${tokenObj.token}`
			}
		}).then(response => {
			expect(response).to.be.an('array');
			expect(response).to.have.lengthOf(2);
			expect(response[0]).to.be.an('object');
			expect(response[0]).to.haveOwnProperty('uid');
			if (patient.uid) {
				expect(response[0].uid).to.be.equal(patient.uid);
			}
			expect(response[0]).to.haveOwnProperty('firstName');
			expect(response[0].firstName).to.be.equal(patient.firstName);
			expect(response[0]).to.haveOwnProperty('lastName');
			expect(response[0].lastName).to.be.equal(patient.lastName);
			expect(response[0]).to.haveOwnProperty('isFemale');
			expect(response[0].isFemale).to.be.equal(patient.isFemale);
			if (patient.middleName) {
				expect(response[0]).to.haveOwnProperty('middleName');
				expect(response[0].middleName).to.be.equal(patient.middleName);
			}
			if (patient.fatherName) {
				expect(response[0]).to.haveOwnProperty('fatherName');
				expect(response[0].fatherName).to.be.equal(patient.fatherName);
			}
			if (patient.motherName) {
				expect(response[0]).to.haveOwnProperty('motherName');
				expect(response[0].motherName).to.be.equal(patient.motherName);
			}
			if (patient.dateOfBirth) {
				expect(response[0]).to.haveOwnProperty('dateOfBirth');
				expect(response[0].dateOfBirth).to.be.equal(patient.dateOfBirth);
			}
			if (patient.placeOfBirth) {
				expect(response[0]).to.haveOwnProperty('placeOfBirth');
				expect(response[0].placeOfBirth).to.be.equal(patient.placeOfBirth);
			}
			if (patient.job) {
				expect(response[0]).to.haveOwnProperty('job');
				expect(response[0].job).to.be.equal(patient.job);
			}
			expect(response[0]).to.haveOwnProperty('locations');
			expect(response[0].locations).to.be.an('array');
			expect(response[0].locations).to.have.lengthOf(patient.locations.length);
			response[0].locations.forEach(location => {
				const ind = patient.locations.map(loc => loc._id).indexOf(location._id);
				expect(ind).to.be.greaterThan(-1);
				expect(location).to.be.an('object');
				expect(location).to.haveOwnProperty('name');
				expect(location.name).to.be.equal(patient.locations[ind].name);
				expect(location).to.haveOwnProperty('country');
				expect(location.country).to.be.equal(patient.locations[ind].country);
			});
			expect(response[1]).to.be.an('object');
			expect(response[1]).to.haveOwnProperty('nModified');
			expect(response[1].nModified).to.be.equal(patient.locations.length);

			return axios.getMany('http://localhost:4200/api/location', {
				headers: {
					Authorization: `Bearer ${tokenObj.token}`
				}
			}).then(response2 => {
				response2.forEach(location => {
					if (patient.locations.map(loc => loc._id).includes(location)) {
						const ind = location.patients.map(pat => pat._id).indexOf(patient._id);
						expect(ind).to.be.greaterThan(-1);
						expect(location.patients[ind]).to.be.an('object');
						expect(location.patients[ind]).to.haveOwnProperty('uid');
						expect(location.patients[ind].uid).to.be.equal(response[0].uid);
						expect(location.patients[ind]).to.haveOwnProperty('firstName');
						expect(location.patients[ind].firstName).to.be.equal(patient.firstName);
						expect(location.patients[ind]).to.haveOwnProperty('lastName');
						expect(location.patients[ind].lastName).to.be.equal(patient.lastName);
						expect(location.patients[ind]).to.haveOwnProperty('isFemale');
						expect(location.patients[ind].isFemale).to.be.equal(patient.isFemale);
						if (patient.dateOfBirth) {
							expect(location.patients[ind]).to.haveOwnProperty('dateOfBirth');
							expect(location.patients[ind].dateOfBirth).to.be.equal(patient.dateOfBirth);
						}
					}
				});
			}).then(() => patients = [response[0]]);
		});
	});

	it('getOne', () => {
		return axios.getOne(url, patients[0]._id, {
			headers: {
				Authorization: `Bearer ${tokenObj.token}`,
			}
		}).then(response => {
			expect(response).to.be.an('object');
			expect(response).to.haveOwnProperty('locations');
			expect(response.locations).to.be.an('array');
			expect(response.locations).to.have.lengthOf(patients[0].locations.length);
			response.locations.forEach(location => {
				const ind = patients[0].locations.map(loc => loc._id).indexOf(location._id);
				expect(ind).to.be.greaterThan(-1);
				expect(location).to.be.an('object');
				expect(location).to.haveOwnProperty('name');
				expect(location.name).to.be.equal(patients[0].locations[ind].name);
				expect(location).to.haveOwnProperty('country');
				expect(location.country).to.be.equal(patients[0].locations[ind].country);
			});
		});
	});

	it('updateOne', () => {
		const changes = updatePatients(patients)[0];
		return axios.updateOne(url, patients[0]._id, changes, {
			headers: {
				Authorization: `Bearer ${tokenObj.token}`
			}
		}).then(response => {
			expect(response).to.be.an('array');
			expect(response).to.have.lengthOf(2);
			expect(response[0]).to.be.an('object');
			expect(response[0]).to.haveOwnProperty('uid');
			expect(response[0].uid).to.be.equal(changes.uid);
			expect(response[0]).to.haveOwnProperty('firstName');
			expect(response[0].firstName).to.be.equal(changes.firstName);
			expect(response[0]).to.haveOwnProperty('lastName');
			expect(response[0].lastName).to.be.equal(changes.lastName);
			expect(response[0]).to.haveOwnProperty('isFemale');
			expect(response[0].isFemale).to.be.equal(changes.isFemale);
			expect(response[0]).to.haveOwnProperty('locations');
			expect(response[0].locations).to.be.an('array');
			expect(response[0].locations).to.have.lengthOf(changes.locations.length);
			changes.locations.forEach((location, i) => {
				expect(response[0].locations[i]).to.be.an('object');
				Object.keys(location).forEach(key => {
					expect(response[0].locations[i]).to.haveOwnProperty(key);
					expect(response[0].locations[i][key]).to.be.equal(location[key]);
				});
			});
			expect(response[1]).to.be.an('object');
			expect(response[1]).to.haveOwnProperty('nModified');
			expect(response[1].nModified).to.be.equal(uniqueLocations(patients,
				changes.removedLocations));

			return axios.getMany('http://localhost:4200/api/location', {
				headers: {
					Authorization: `Bearer ${tokenObj.token}`,
				}
			}).then(response2 => {
				response2.forEach(location => {
					if (patients[0].locations.map(loc => loc._id).includes(location._id)) {
						const ind = location.patients.map(pat => pat._id).indexOf(patients[0]._id);
						expect(ind).to.be.greaterThan(-1);
						expect(location.patients[ind]).to.be.an('object');
						expect(location.patients[ind]).to.haveOwnProperty('uid');
						expect(location.patients[ind].uid).to.be.equal(patients[0].uid);
						expect(location.patients[ind]).to.haveOwnProperty('firstName');
						expect(location.patients[ind].firstName).to.be.equal(patients[0].firstName);
						expect(location.patients[ind]).to.haveOwnProperty('lastName');
						expect(location.patients[ind].lastName).to.be.equal(patients[0].lastName);
						expect(location.patients[ind]).to.haveOwnProperty('isFemale');
						expect(location.patients[ind].isFemale).to.be.equal(patients[0].isFemale);
						if (patients[0].dateOfBirth) {
							expect(location.patients[ind]).to.haveOwnProperty('dateOfBirth');
							expect(location.patients[ind].dateOfBirth).to.be.equal(patients[0].dateOfBirth);
						}
					}
				});
			});
		});
	});

	it('deleteOne', () => {
		return axios.deleteOne(url, patients[0]._id, {
			data: {
				locations: patients[0].locations,
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
			expect(response[1].nModified).to.be.equal(patients[0].locations.length);

			return axios.getMany('http://localhost:4200/api/patient', {
				headers: {
					Authorization: `Bearer ${tokenObj.token}`,
				}
			}).then(response2 => {
				response2.forEach(location => {
					if (patients[0].locations.map(loc => loc._id).includes(location._id)) {
						expect(location.patients.map(pat => pat._id)).to.not.include(patients[0]._id);
					}
				});
			}).then(() => patients.pop());
		});
	});
});

/**
 * generates patients stub for tests.
 * @param {*} num num of patients to generate.
 */
function generatePatients(num) {
	if (num <= 0) {
		throw new Error('num must be positive!');
	}

	const patients = [];

	for (let i = 0; i < num; i++) {
		patients.push({
			firstName: `fn${i}`,
			lastName: `ln${i}`,
			isFemale: i % 2 == 0,
			locations: [{
				_id: locations[0]._id,
				name: locations[0].name,
				country: locations[0].country
			}, {
				_id: locations[2]._id,
				name: locations[2].name,
				country: locations[2].country
			}]
		});
	}

	return patients;
}

function uniqueLocations(patients, removedLocations) {
	let count = 0;

	let uniques = {};
	patients.forEach(patient => {
		patient.locations.map(location => location._id).forEach(id => {
			uniques[id] = true;
		});
	});

	count += Object.keys(uniques).length;

	uniques = {};
	if (removedLocations) {
		removedLocations.forEach(elem => {
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
 * updates all locations.
 * @returns changes array.
 */
function updatePatients(patients) {
	const changes = [];

	patients[0].firstName += ' updated';
	patients[0].locations = [{
		_id: locations[1]._id,
		name: locations[1].name,
		country: locations[1].country
	}];

	if (patients.length > 1) {
		patients[1].lastName = ' updated';
		patients[1].locations.push({
			_id: locations[1]._id,
			name: locations[1].name,
			country: locations[1].country
		});
	}

	patients.forEach(patient => {
		changes.push({
			_id: patient._id,
			uid: patient.uid,
			firstName: patient.firstName,
			lastName: patient.lastName,
			isFemale: patient.isFemale,
			locations: patient.locations
		});
	});

	changes[0].removedLocations = [locations[0]._id, locations[2]._id];

	if (patients.length > 1) {
		changes[1].removedLocations = [];
	}

	return changes;
}
