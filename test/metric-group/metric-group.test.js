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

const metrics = [];

describe('metric-group.controller.js', () => {
	let groups = [];

	let tokenObj;

	before(async () => {
		tokenObj = await axios.insertMany('http://localhost:4200/api/user/login', {
			login: 'superuser',
			password: require('../../server/secret').superpassword
		});

		for (let i = 0; i < 3; i++) {
			let metric = {
				name: `test00${i}`,
				description: 'ignore me!',
				isRequired: false,
				dataType: 'boolean'
			};

			const res = await axios.insertOne('http://localhost:4200/api/metric', metric, {
				headers: {
					Authorization: `Bearer ${tokenObj.token}`
				}
			});
			metric._id = res[0]._id;

			metrics.push(metric);
		}
	});

	after(() => {
		axios.deleteMany('http://localhost:4200/api/metric', {
			headers: {
				Authorization: `Bearer ${tokenObj.token}`
			},
			data: metrics.map(metric => {
				return {
					_id: metric._id,
					groups: metric.groups
				};
			})
		});
	});

	it('insertMany', () => {
		const num = 2;
		const tempGroups = generateGroups(num);
		return axios.insertMany(url, tempGroups, {
			headers: {
				Authorization: `Bearer ${tokenObj.token}`
			}
		}).then(response => {
			expect(response).to.be.an('array');
			expect(response).to.have.lengthOf(2);
			expect(response[0]).to.be.an('array');
			expect(response[0]).to.have.lengthOf(num);
			response[0].forEach((grp, i) => {
				expect(grp).to.be.an('object');
				Object.keys(tempGroups[i]).forEach(key => {
					if (!(grp[key] instanceof Object) && !(grp[key] instanceof Array)) {
						expect(tempGroups[i][key]).to.be.equal(grp[key]);
					}
				});

				expect(grp).to.haveOwnProperty('metrics');
				expect(grp.metrics).to.be.an('array');
				expect(grp.metrics).to.be.lengthOf(tempGroups[i].metrics.length);
				grp.metrics.forEach((metric, j) => {
					expect(tempGroups[i].metrics.map(met => met._id)).to.include(metric._id);
					expect(metric).to.be.an('object');
					expect(metric).to.haveOwnProperty('name');
					expect(metric.name).to.be.equal(tempGroups[i].metrics[j].name);
					expect(metric).to.haveOwnProperty('description');
					expect(metric.description).to.be.equal(tempGroups[i].metrics[j].description);
					expect(metric).to.haveOwnProperty('isRequired');
					expect(metric.isRequired).to.be.equal(tempGroups[i].metrics[j].isRequired);
					expect(metric).to.haveOwnProperty('dataType');
					expect(metric.dataType).to.be.equal(tempGroups[i].metrics[j].dataType);
				});
			});
			expect(response[1]).to.be.an('object');
			expect(response[1]).to.haveOwnProperty('nModified');
			expect(response[1].nModified).to.be.equal(uniqueMetrics(tempGroups));

			axios.getMany('http://localhost:4200/api/metric', {
				headers: {
					Authorization: `Bearer ${tokenObj.token}`
				}
			}).then(response2 => {
				response[0].forEach(group => {
					response2.forEach(metric => {
						if (group.metrics.map(met => met._id).includes(metric)) {
							const ind = metric.groups.map(grp => grp._id).indexOf(group._id);
							expect(ind).to.be.greaterThan(-1);
							expect(metric.groups[ind]).to.be.an('object');
							expect(metric.groups[ind]).to.haveOwnProperty('name');
							expect(metric.groups[ind].name).to.be.equal(group.name);
							expect(metric.groups[ind]).to.haveOwnProperty('description');
							expect(metric.groups[ind].description).to.be.equal(group.description);
						}
					});
				});
			});

			groups = [...groups, ...response[0]];
		});
	});

	it('getMany', () => {
		return axios.getMany(url, {
			headers: {
				Authorization: `Bearer ${tokenObj.token}`,
			}
		}).then(response => {
			expect(response).to.be.an('array');
			response.forEach((group, i) => {
				expect(group).to.be.an('object');
				expect(group).to.haveOwnProperty('_id');
				if (groups.map(met => met._id).includes(group._id)) {
					expect(group).to.haveOwnProperty('metrics');
					expect(group.metrics).to.be.an('array');
					expect(group.metrics).to.have.lengthOf(groups[i].metrics.length);
					group.metrics.forEach(metric => {
						const ind = metrics.map(met => met._id).indexOf(metric._id);
						expect(ind).to.be.greaterThan(-1);
						expect(metric).to.be.an('object');
						expect(metric).to.haveOwnProperty('_id');
						expect(metric._id).to.be.equal(metrics[ind]._id);
						expect(metric).to.haveOwnProperty('name');
						expect(metric.name).to.be.equal(metrics[ind].name);
						expect(metric).to.haveOwnProperty('description');
						expect(metric.description).to.be.equal(metrics[ind].description);
						expect(metric).to.haveOwnProperty('dataType');
						expect(metric.dataType).to.be.equal(metrics[ind].dataType);
						expect(metric).to.haveOwnProperty('isRequired');
						expect(metric.isRequired).to.be.equal(metrics[ind].isRequired);
					});
				}
			});
		});
	});

	it('updateMany', () => {
		const changes = updateMetricGroups(groups);
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
			expect(response[1].nModified).to.be.equal(uniqueMetrics(changes,
				changes.map(change => change.removedMetrics)));

			axios.getMany('http://localhost:4200/api/metric-group', {
				headers: {
					Authorization: `Bearer ${tokenObj.token}`,
				}
			}).then(response2 => {
				groups.forEach(group => {
					response2.forEach(metric => {
						if (group.metrics.map(met => met._id).includes(metric._id)) {
							const ind = metric.groups.map(grp => grp._id).indexOf(group._id);
							expect(ind).to.be.greaterThan(-1);
							expect(metric.groups[ind]).to.be.an('object');
							expect(metric.groups[ind]).to.haveOwnProperty('name');
							expect(metric.groups[ind].name).to.be.equal(group.name);
							expect(metric.groups[ind]).to.haveOwnProperty('description');
							expect(metric.groups[ind].description).to.be.equal(group.description);
						}
					});
				});
			});
		});
	});

	it('deleteMany', () => {
		return axios.deleteMany(url, {
			data: groups,
			headers: {
				Authorization: `Bearer ${tokenObj.token}`
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

			axios.getMany('http://localhost:4200/api/metric', {
				headers: {
					Authorization: `Bearer ${tokenObj.token}`
				}
			}).then(response2 => {
				groups.forEach(group => {
					response2.forEach(metric => {
						if (group.metrics.map(met => met._id).includes(metric)) {
							expect(metric.groups.map(grp => grp._id)).to.not.include(group._id);
						}
					});
				});
			});

			groups = [];
		});
	});

	it('insertOne', () => {
		const group = generateGroups(1)[0];
		return axios.insertOne(url, group, {
			headers: {
				Authorization: `Bearer ${tokenObj.token}`
			}
		}).then(response => {
			expect(response).to.be.an('array');
			expect(response).to.have.lengthOf(2);
			expect(response[0]).to.be.an('object');
			expect(response[0]).to.haveOwnProperty('name');
			expect(response[0].name).to.be.equal(group.name);
			expect(response[0]).to.haveOwnProperty('description');
			expect(response[0].description).to.be.equal(group.description);
			expect(response[0]).to.haveOwnProperty('metrics');
			expect(response[0].metrics).to.be.an('array');
			expect(response[0].metrics).to.have.lengthOf(group.metrics.length);
			response[0].metrics.forEach(metric => {
				const ind = group.metrics.map(met => met._id).indexOf(metric._id);
				expect(ind).to.be.greaterThan(-1);
				expect(metric).to.be.an('object');
				expect(metric).to.haveOwnProperty('name');
				expect(metric.name).to.be.equal(group.metrics[ind].name);
				expect(metric).to.haveOwnProperty('description');
				expect(metric.description).to.be.equal(group.metrics[ind].description);
				expect(metric).to.haveOwnProperty('dataType');
				expect(metric.dataType).to.be.equal(group.metrics[ind].dataType);
				expect(metric).to.haveOwnProperty('isRequired');
				expect(metric.isRequired).to.be.equal(group.metrics[ind].isRequired);
			});
			expect(response[1]).to.be.an('object');
			expect(response[1]).to.haveOwnProperty('nModified');
			expect(response[1].nModified).to.be.equal(group.metrics.length);

			axios.getMany('http://localhost:4200/api/metric', {
				headers: {
					Authorization: `Bearer ${tokenObj.token}`
				}
			}).then(response2 => {
				response2.forEach(metric => {
					if (group.metrics.map(met => met._id).includes(metric)) {
						const ind = metric.groups.map(grp => grp._id).indexOf(group._id);
						expect(ind).to.be.greaterThan(-1);
						expect(metric.groups[ind]).to.be.an('object');
						expect(metric.groups[ind]).to.haveOwnProperty('name');
						expect(metric.groups[ind].name).to.be.equal(group.name);
						expect(metric.groups[ind]).to.haveOwnProperty('description');
						expect(metric.groups[ind].description).to.be.equal(group.description);
					}
				});
			});

			groups = [response[0]];
		});
	});

	it('getOne', () => {
		return axios.getOne(url, groups[0]._id, {
			headers: {
				Authorization: `Bearer ${tokenObj.token}`,
			}
		}).then(response => {
			expect(response).to.be.an('object');
			expect(response).to.haveOwnProperty('_id');
			expect(response._id).to.be.equal(groups[0]._id);
			expect(response).to.haveOwnProperty('name');
			expect(response.name).to.be.equal(groups[0].name);
			expect(response).to.haveOwnProperty('description');
			expect(response.description).to.be.equal(groups[0].description);
			expect(response).to.haveOwnProperty('metrics');
			response.metrics.forEach(metric => {
				const ind = groups[0].metrics.map(met => met._id).indexOf(metric._id);
				expect(ind).to.be.greaterThan(-1);
				expect(metric).to.be.an('object');
				expect(metric).to.haveOwnProperty('name');
				expect(metric.name).to.be.equal(groups[0].metrics[ind].name);
				expect(metric).to.haveOwnProperty('description');
				expect(metric.description).to.be.equal(groups[0].metrics[ind].description);
				expect(metric).to.haveOwnProperty('dataType');
				expect(metric.dataType).to.be.equal(groups[0].metrics[ind].dataType);
				expect(metric).to.haveOwnProperty('isRequired');
				expect(metric.isRequired).to.be.equal(groups[0].metrics[ind].isRequired);
			});
		});
	});

	it('updateOne', () => {
		const changes = updateMetricGroups(groups);
		return axios.updateOne(url, groups[0]._id, changes[0], {
			headers: {
				Authorization: `Bearer ${tokenObj.token}`
			}
		}).then(response => {
			expect(response).to.be.an('array');
			expect(response).to.have.lengthOf(2);
			expect(response[0]).to.be.an('object');
			expect(response[0]).to.haveOwnProperty('name');
			expect(response[0].name).to.be.equal(changes[0].name);
			expect(response[0]).to.haveOwnProperty('description');
			expect(response[0].description).to.be.equal(changes[0].description);
			expect(response[0]).to.haveOwnProperty('metrics');
			expect(response[0].metrics).to.be.an('array');
			expect(response[0].metrics).to.have.lengthOf(changes[0].metrics.length);
			changes[0].metrics.forEach((metric, i) => {
				expect(response[0].metrics[i]).to.be.an('object');
				Object.keys(metric).forEach(key => {
					expect(response[0].metrics[i]).to.haveOwnProperty(key);
					expect(response[0].metrics[i][key]).to.be.equal(metric[key]);
				});
			});
			expect(response[1]).to.be.an('object');
			expect(response[1]).to.haveOwnProperty('nModified');
			expect(response[1].nModified).to.be.equal(uniqueMetrics(groups,
				changes.map(change => change.removedMetrics)));

			axios.getMany('http://localhost:4200/api/metric', {
				headers: {
					Authorization: `Bearer ${tokenObj.token}`,
				}
			}).then(response2 => {
				response2.forEach(metric => {
					if (groups[0].metrics.map(met => met._id).includes(metric._id)) {
						const ind = metric.groups.map(grp => grp._id).indexOf(groups[0]._id);
						expect(ind).to.be.greaterThan(-1);
						expect(metric.groups[ind]).to.be.an('object');
						expect(metric.groups[ind]).to.haveOwnProperty('name');
						expect(metric.groups[ind].name).to.be.equal(groups[0].name);
						expect(metric.groups[ind]).to.haveOwnProperty('description');
						expect(metric.groups[ind].description).to.be.equal(groups[0].description);
					}
				});
			});
		});
	});

	it('deleteOne', () => {
		return axios.deleteOne(url, groups[0]._id, {
			data: {
				metrics: groups[0].metrics,
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
			expect(response[1].nModified).to.be.equal(groups[0].metrics.length);

			axios.getMany('http://localhost:4200/api/metric-group', {
				headers: {
					Authorization: `Bearer ${tokenObj.token}`,
				}
			}).then(response2 => {
				response2.forEach(metric => {
					if (groups[0].metrics.map(met => met._id).includes(metric._id)) {
						expect(metric.groups.map(grp => grp._id)).to.not.include(groups[0]._id);
					}
				});
			});

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
			metrics: [{
				_id: metrics[0]._id,
				name: metrics[0].name,
				description: metrics[0].description,
				isRequired: metrics[0].isRequired,
				dataType: metrics[0].dataType
			}, {
				_id: metrics[2]._id,
				name: metrics[2].name,
				description: metrics[2].description,
				isRequired: metrics[2].isRequired,
				dataType: metrics[2].dataType
			}]
		});
	}

	return groups;
}

function uniqueMetrics(groups, removedMetrics) {
	let count = 0;

	let uniques = {};
	groups.forEach(group => {
		group.metrics.map(metric => metric._id).forEach(id => {
			uniques[id] = true;
		});
	});

	count += Object.keys(uniques).length;

	uniques = {};
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

	count += Object.keys(uniques).length;

	return count;
}

/**
 * updates all metrics.
 * @returns changes array.
 */
function updateMetricGroups(groups) {
	const changes = [];

	groups[0].name += ' updated';
	groups[0].metrics = [{
		_id: metrics[1]._id,
		name: metrics[1].name,
		description: metrics[1].description,
		isRequired: metrics[1].isRequired,
		dataType: metrics[1].dataType
	}];

	if (groups.length > 1) {
		groups[1].description = 'new desc';
		groups[1].metrics.push({
			_id: metrics[1]._id,
			name: metrics[1].name,
			description: metrics[1].description,
			isRequired: metrics[1].isRequired,
			dataType: metrics[1].dataType
		});
	}

	groups.forEach(group => {
		changes.push({
			_id: group._id,
			name: group.name,
			description: group.description,
			metrics: group.metrics
		});
	});

	changes[0].removedMetrics = [metrics[0]._id, metrics[2]._id];

	if (groups.length > 1) {
		changes[1].removedMetrics = [];
	}

	return changes;
}
