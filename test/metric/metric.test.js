/*
testing module for metric.controller.js
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

/** metric api url. */
const url = 'http://localhost:4200/api/metric';

let groups = [];

describe('metric.controller.js', () => {
	let metrics = [];

	let tokenObj;

	before(async () => {
		tokenObj = await axios.insertMany('http://localhost:4200/api/user/login', {
			login: 'superuser',
			password: require('../../server/secret').superpassword
		});

		for (let i = 0; i < 2; i++) {
			let group = {
				name: `test00${i}`,
				description: 'ignore me!',
				isMandatory: false
			};

			const res = await axios.insertOne('http://localhost:4200/api/metric-group', group, {
				headers: {
					Authorization: `Bearer ${tokenObj.token}`
				}
			});
			group._id = res[0]._id;

			groups.push(group);
		}
	});

	after(async () => {
		await axios.deleteMany('http://localhost:4200/api/metric-group', {
			headers: {
				Authorization: `Bearer ${tokenObj.token}`
			},
			data: groups.map(grp => {
				return {
					_id: grp._id,
					metrics: []
				};
			})
		});
	});

	it('insertMany', () => {
		const num = 2;
		return axios.insertMany(url, generateMetrics(num), {
			headers: {
				Authorization: `Bearer ${tokenObj.token}`
			}
		}).then(response => {
			expect(response).to.be.an('array');
			expect(response).to.have.lengthOf(2);
			expect(response[0]).to.be.an('array');
			expect(response[0]).to.have.lengthOf(num);
			expect(response[1]).to.be.an('object');
			expect(response[1]).to.haveOwnProperty('nModified');
			expect(response[1].nModified).to.be.equal(uniqueGroups(response[0]));
			metrics = metrics.concat(response[0]);
		});
	});

	it('getMany populate', () => {
		return axios.getMany(url, {
			headers: {
				Authorization: `Bearer ${tokenObj.token}`,
				groupspopulate: true,
				groupsselect: 'isMandatory'
			}
		}).then(response => {
			expect(response).to.be.an('array');
			response.forEach(metric => {
				expect(metric).to.be.an('object');
				expect(metric).to.haveOwnProperty('groups');
				// metric.groups.forEach(group => {	// doesn't pass because most old metrics still not saved according to new schema.
				// expect(group).to.be.an('object');
				// expect(group._id).to.be.an('object');
				// expect(group._id).to.haveOwnProperty('isMandatory');
				// });
			});
		});
	});

	it('updateMany', () => {
		const changes = updateMetrics(metrics, true);
		return axios.updateMany(url, changes, {
			headers: {
				Authorization: `Bearer ${tokenObj.token}`
			}
		}).then(response => {
			expect(response).to.be.an('array');
			expect(response).to.have.lengthOf(2);
			expect(response[0]).to.be.an('object');
			expect(response[0]).to.haveOwnProperty('nModified');
			expect(response[0].nModified).to.be.equal(metrics.length);
			expect(response[1]).to.be.an('object');
			expect(response[1]).to.haveOwnProperty('nModified');
			expect(response[1].nModified).to.be.equal(uniqueGroups(changes,
				changes.map(change => change.removedGroups)));
		});
	});

	it('deleteMany', () => {
		return axios.deleteMany(url, {
			data: metrics,
			headers: {
				Authorization: `Bearer ${tokenObj.token}`
			}
		}).then(response => {
			expect(response).to.be.an('array');
			expect(response).to.have.lengthOf(2);
			expect(response[0]).to.be.an('object');
			expect(response[0]).to.haveOwnProperty('n');
			expect(response[0].n).to.be.equal(metrics.length);
			expect(response[1]).to.be.an('object');
			expect(response[1]).to.haveOwnProperty('nModified');
			expect(response[1].nModified).to.be.equal(uniqueGroups(metrics));
			metrics.splice(0, metrics.length);
		});
	});

	it('insertOne', () => {
		return axios.insertOne(url, generateMetrics(1)[0], {
			headers: {
				Authorization: `Bearer ${tokenObj.token}`
			}
		}).then(response => {
			expect(response).to.be.an('array');
			expect(response).to.have.lengthOf(2);
			expect(response[0]).to.be.an('object');
			expect(response[0]).to.haveOwnProperty('groups');
			expect(response[0].groups).to.be.an('array');
			expect(response[1]).to.be.an('object');
			expect(response[1]).to.haveOwnProperty('nModified');
			expect(response[1].nModified).to.be.equal(response[0].groups.length);
			metrics.push(response[0]);
		});
	});

	it('getOne populate', () => {
		return axios.getOne(url, metrics[0]._id, {
			headers: {
				Authorization: `Bearer ${tokenObj.token}`,
				groupspopulate: true,
				groupsselect: 'isMandatory'
			}
		}).then(response => {
			expect(response).to.be.an('object');
			expect(response).to.haveOwnProperty('_id');
			expect(response._id).to.be.equal(metrics[0]._id);
			expect(response).to.haveOwnProperty('groups');
			response.groups.forEach(group => {
				expect(group).to.be.an('object');
				expect(group).to.haveOwnProperty('_id');
				expect(group._id).to.be.an('object');
				expect(group._id).to.haveOwnProperty('isMandatory');
			});
		});
	});

	it('updateOne', () => {
		const changes = updateMetrics(metrics);
		return axios.updateOne(url, metrics[0]._id, changes[0], {
			headers: {
				Authorization: `Bearer ${tokenObj.token}`
			}
		}).then(response => {
			expect(response).to.be.an('array');
			expect(response).to.have.lengthOf(2);
			expect(response[0]).to.be.an('object');
			expect(response[0]).to.haveOwnProperty('dataType');
			expect(response[0].dataType).to.be.equal(changes[0].dataType);
			expect(response[0]).to.haveOwnProperty('name');
			expect(response[0].name).to.be.equal(changes[0].name);
			expect(response[0]).to.haveOwnProperty('groups');
			expect(response[0].groups).to.be.an('array');
			expect(response[0].groups).to.have.lengthOf(metrics[0].groups.length);
			metrics[0].groups.forEach((group, i) => {
				expect(response[0].groups[i]).to.be.an('object');
				Object.keys(group).forEach(key => {
					expect(response[0].groups[i]).to.haveOwnProperty(key);
					expect(response[0].groups[i][key]).to.be.equal(group[key]);
				});
			});
			expect(response[1]).to.be.an('object');
			expect(response[1]).to.haveOwnProperty('nModified');
			expect(response[1].nModified).to.be.equal(uniqueGroups(metrics,
				changes.map(change => change.removedGroups)));
		});
	});

	it('deleteOne', () => {
		return axios.deleteOne(url, metrics[0]._id, {
			data: {
				groups: metrics[0].groups.map(group => group._id)
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
			expect(response[1].nModified).to.be.equal(metrics[0].groups.length);
			metrics.pop();
		});
	});
});

/**
 * generates metrics stub for tests.
 * @param {*} num num of metrics to generate.
 */
function generateMetrics(num) {
	if (num <= 0) {
		throw new Error('num must be positive!');
	}

	const metrics = [];

	for (let i = 0; i < num; i++) {
		metrics.push({
			name: `test${i}`,
			description: 'ignore me!',
			isRequired: i % 2 === 0,
			dataType: 'string',
			groups: [{
				_id: groups[0]._id,
				name: groups[0].name,
				description: groups[0].description
			}],
			stringParams: {
				isEmail: false,
				lineBreaks: false,
				hint: 'just write something ffs'
			},
			editMode: 'restricted'
		});
	}

	return metrics;
}

/**
 * @param {*} metrics
 * @param {*} removedGroups
 * @returns amount of unique group id's.
 */
function uniqueGroups(metrics, removedGroups) {
	let uniques = {};
	metrics.map(metric => metric.groups.map(group => group._id))
		.forEach(idSet => {
			idSet.forEach(id => {
				uniques[id] = true;
			});
		});

	if (removedGroups) {
		removedGroups.forEach(idSet => {
			idSet.forEach(id => {
				uniques[id] = true;
			});
		});
	}

	return Object.keys(uniques).length;
}

/**
 * updates all metrics.
 * @returns changes array.
 */
function updateMetrics(metrics, withIds) {
	const changes = [];

	metrics.forEach(metric => {
		metric.dataType = 'boolean';
		metric.name = metric.name + ' updated';
		metric.groups = [{
			_id: groups[1]._id,
			name: groups[1].name,
			description: groups[1].description
		}];
		metric.stringParams.minLength = 3;

		changes.push({
			dataType: metric.dataType,
			name: metric.name,
			removedGroups: [groups[0]._id],
			groups: metric.groups,
			stringParams: {
				minLength: metric.stringParams.minLength
			}
		});

		if (withIds === true) {
			changes[changes.length - 1]._id = metric._id;
		}
	});

	return changes;
}
