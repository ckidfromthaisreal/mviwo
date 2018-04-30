/*
testing module for metric-group.controller.js
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

/** metric-group api url. */
const url = 'http://localhost:4200/api/metric-group';

describe('metric-group.controller.js', () => {
	let groups = [];
	// beforeEach(() => {
	//   nock('http://localhost:8080').get('/metric').reply(200, response);
	// });

	it('insertMany', () => {
		const num = 2;
		return axios.insertMany(url, {
			resources: generateGroups(num)
		}).then(response => {
			expect(response).to.be.an('array');
			expect(response).to.have.lengthOf(2);
			expect(response[0]).to.be.an('array');
			expect(response[0]).to.have.lengthOf(num);
			expect(response[1]).to.be.an('object');
			expect(response[1]).to.haveOwnProperty('nModified');
			expect(response[1].nModified).to.be.equal(uniqueMetrics(response[0]));
			groups = groups.concat(response[0]);
		});
	});

	it('getMany populate', () => {
		return axios.getMany(url, {
			headers: {
				'metricspopulate': true,
				// 'metricsselect': 'isMandatory'
			}
		}).then(response => {
			expect(response).to.be.an('array');
			expect(response).to.have.lengthOf.at.least(1);
			response.forEach(group => {
				expect(group).to.be.an('object');
				expect(group).to.haveOwnProperty('metrics');
				// metric.groups.forEach(group => {
				//     expect(group).to.be.an('object');
				//     expect(group).to.haveOwnProperty('isMandatory');
				// });
			});
		});
	});

	it('updateMany', () => {
		const changes = updateMetricGroups(groups, true);
		return axios.updateMany(url, {
			resources: changes
		}).then(response => {
			expect(response).to.be.an('array');
			expect(response).to.have.lengthOf(2);
			expect(response[0]).to.be.an('object');
			expect(response[0]).to.haveOwnProperty('nModified');
			expect(response[0].nModified).to.be.equal(groups.length);
			expect(response[1]).to.be.an('object');
			expect(response[1]).to.haveOwnProperty('nModified');
			expect(response[1].nModified).to.be.equal(uniqueMetrics(changes,
				changes.map(change => change.removedMetrics)));
		});
	});

	it('deleteMany', () => {
		return axios.deleteMany(url, {
			data: {
				resources: groups
			}
		}).then(response => {
			expect(response).to.be.an('array');
			expect(response).to.have.lengthOf(2);
			expect(response[0]).to.be.an('object');
			expect(response[0]).to.haveOwnProperty('n');
			expect(response[0].n).to.be.equal(groups.length);
			expect(response[1]).to.be.an('object');
			expect(response[1]).to.haveOwnProperty('nModified');
			expect(response[1].nModified).to.be.equal(uniqueMetrics(groups));
			groups.splice(0, groups.length);
		});
	});

	it('insertOne', () => {
		return axios.insertOne(url, {
			resources: generateGroups(1)[0]
		}).then(response => {
			expect(response).to.be.an('array');
			expect(response).to.have.lengthOf(2);
			expect(response[0]).to.be.an('object');
			expect(response[0]).to.haveOwnProperty('metrics');
			expect(response[0].metrics).to.be.an('array');
			expect(response[1]).to.be.an('object');
			expect(response[1]).to.haveOwnProperty('nModified');
			expect(response[1].nModified).to.be.equal(response[0].metrics.length);
			groups.push(response[0]);
		});
	});

	it('getOne populate', () => {
		return axios.getOne(url, groups[0]._id, {
			headers: {
				'metricspopulate': true,
				'metricsselect': 'name description'
			}
		}).then(response => {
			expect(response).to.be.an('object');
			expect(response).to.haveOwnProperty('_id');
			expect(response._id).to.be.equal(groups[0]._id);
			expect(response).to.haveOwnProperty('metrics');
			// response.groups.forEach(group => {
			//     expect(group).to.be.an('object');
			//     expect(group).to.haveOwnProperty('isMandatory');
			// });
		});
	});

	it('updateOne', () => {
		const changes = updateMetricGroups(groups);

		return axios.updateOne(url, groups[0]._id, {
			resources: changes[0]
		}).then(response => {
			expect(response).to.be.an('array');
			expect(response).to.have.lengthOf(2);
			expect(response[0]).to.be.an('object');
			expect(response[0]).to.haveOwnProperty('name');
			expect(response[0].name).to.be.equal(changes[0].name);
			expect(response[0]).to.haveOwnProperty('metrics');
			expect(response[0].metrics).to.be.an('array');
			expect(response[0].metrics).to.have.lengthOf(groups[0].metrics.length);
			response[0].metrics.forEach((metric, i) => {
				expect(metric).to.be.equal(changes[0].metrics[i]);
			});
			// groups[0].metrics.forEach((metric, i) => {
			// 	expect(response[0].metrics[i]).to.be.an('object');
			// 	Object.keys(metric).forEach(key => {
			// 		expect(response[0].metrics[i]).to.haveOwnProperty(key);
			// 		expect(response[0].metrics[i][key]).to.be.equal(metric[key]);
			// 	});
			// });
			expect(response[1]).to.be.an('object');
			expect(response[1]).to.haveOwnProperty('nModified');
			expect(response[1].nModified).to.be.equal(uniqueMetrics(groups,
				changes.map(change => change.removedMetrics)));
		});
	});

	it('deleteOne', () => {
		return axios.deleteOne(url, groups[0]._id, {
			data: {
				metrics: groups[0].metrics
			}
		}).then(response => {
			expect(response).to.be.an('array');
			expect(response).to.have.lengthOf(2);
			expect(response[0]).to.be.an('object');
			expect(response[1]).to.be.an('object');
			expect(response[1]).to.haveOwnProperty('nModified');
			expect(response[1].nModified).to.be.equal(groups[0].metrics.length);
			groups.pop();
		});
	});
});

/**
 * generates metric-groups stub for tests.
 * @param {*} num num of metric-groups to generate.
 */
function generateGroups(num) {
	if (num <= 0) {
		throw new Error('num must be positive!');
	}

	const groups = [];

	for (let i = 0; i < num; i++) {
		groups.push({
			name: `test${i}`,
			description: 'ignore me!',
			isMandatory: i % 2 === 0,
			lastUpdate: Date.now,
			metrics: ['5acc2ec2a673854f24c61151']
		});
	}

	return groups;
}

function uniqueMetrics(groups, removedMetrics) {
	let uniques = {};

	groups.map(group => group.metrics).forEach(idSet => {
		idSet.forEach(id => {
			uniques[id] = true;
		});
	});

	if (removedMetrics) {
		removedMetrics.forEach(elem => {
			if (Array.isArray(elem)) {
				elem.forEach(id => {
					uniques[id] = true;
				});
			} else {
				uniques[elem] = true;
			}
		});
	}

	return Object.keys(uniques).length;
}

/**
 * updates all metrics.
 * @returns changes array.
 */
function updateMetricGroups(groups, withIds) {
	const changes = [];

	groups.forEach(group => {
		group.name = group.name + ' updated';
		group.metrics = ['5acca96ca673854f24c61153', '5acca8c2a673854f24c61152'];

		changes.push({
			name: group.name,
			removedMetrics: ['5acc2ec2a673854f24c61151'],
			metrics: group.metrics
		});

		if (withIds === true) {
			changes[changes.length - 1]._id = group._id;
		}
	});

	return changes;
}