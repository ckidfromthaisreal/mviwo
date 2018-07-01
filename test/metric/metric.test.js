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

const groups = [];

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
				description: 'ignore me!'
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
		const tempMetrics = generateMetrics(num);
		return axios.insertMany(url, tempMetrics, {
			headers: {
				Authorization: `Bearer ${tokenObj.token}`
			}
		}).then(response => {
			expect(response).to.be.an('array');
			expect(response).to.have.lengthOf(2);
			expect(response[0]).to.be.an('array');
			expect(response[0]).to.have.lengthOf(num);
			response[0].forEach((metric, i) => {
				expect(metric).to.be.an('object');
				Object.keys(tempMetrics[i]).forEach(key => {
					if (!(tempMetrics[i][key] instanceof Object) && !(tempMetrics[i][key] instanceof Array)) {
						expect(metric).to.have.haveOwnProperty(key);
						expect(metric[key]).to.be.equal(tempMetrics[i][key]);
					}
				});

				expect(metric).to.haveOwnProperty('groups');
				expect(metric.groups).to.have.lengthOf(tempMetrics[i].groups.length);
				metric.groups.forEach((group, j) => {
					expect(group).to.be.an('object');
					Object.keys(tempMetrics[i].groups[j]).forEach(key => {
						expect(tempMetrics[i].groups[j][key]).to.be.equal(group[key]);
					});
				});
			});
			expect(response[1]).to.be.an('object');
			expect(response[1]).to.haveOwnProperty('nModified');
			expect(response[1].nModified).to.be.equal(uniqueGroups(response[0]));

			axios.getMany('http://localhost:4200/api/metric-group', {
				headers: {
					Authorization: `Bearer ${tokenObj.token}`,
				}
			}).then(response2 => {
				response[0].forEach(metric => {
					response2.forEach(group => {
						if (metric.groups.map(group2 => group2._id).includes(group._id)) {
							const ind = group.metrics.map(met => met._id).indexOf(metric._id);
							expect(ind).to.be.greaterThan(-1);
							expect(group.metrics[ind]).to.be.an('object');
							expect(group.metrics[ind]).to.haveOwnProperty('name');
							expect(group.metrics[ind].name).to.be.equal(metric.name);
							expect(group.metrics[ind]).to.haveOwnProperty('description');
							expect(group.metrics[ind].description).to.be.equal(metric.description);
							expect(group.metrics[ind]).to.haveOwnProperty('isRequired');
							expect(group.metrics[ind].isRequired).to.be.equal(metric.isRequired);
							expect(group.metrics[ind]).to.haveOwnProperty('dataType');
							expect(group.metrics[ind].dataType).to.be.equal(metric.dataType);
						}
					});
				});
			});

			metrics = [...metrics, ...response[0]];
		});
	});

	it('getMany', () => {
		return axios.getMany(url, {
			headers: {
				Authorization: `Bearer ${tokenObj.token}`
			}
		}).then(response => {
			expect(response).to.be.an('array');
			response.forEach(metric => {
				expect(metric).to.be.an('object');
				expect(metric).to.haveOwnProperty('_id');
				if (metrics.map(met => met._id).includes(metric._id)) {
					expect(metric).to.haveOwnProperty('groups');
					expect(metric.groups).to.be.an('array');
					expect(metric.groups.length).to.be.equal(1);
					expect(metric.groups[0]).to.be.an('object');
					expect(metric.groups[0]).to.haveOwnProperty('_id');
					expect(metric.groups[0]._id).to.be.equal(groups[0]._id);
					expect(metric.groups[0]).to.haveOwnProperty('name');
					expect(metric.groups[0].name).to.be.equal(groups[0].name);
					expect(metric.groups[0]).to.haveOwnProperty('description');
					expect(metric.groups[0].description).to.be.equal(groups[0].description);
				}
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
			expect(response[0].nModified).to.be.equal(changes.length);
			expect(response[1]).to.be.an('object');
			expect(response[1]).to.haveOwnProperty('nModified');
			expect(response[1].nModified).to.be.equal(uniqueGroups(changes,
				changes.map(change => change.removedGroups)));

			axios.getMany('http://localhost:4200/api/metric-group', {
				headers: {
					Authorization: `Bearer ${tokenObj.token}`,
				}
			}).then(response2 => {
				metrics.forEach(metric => {
					response2.forEach(group => {
						if (metric.groups.map(group2 => group2._id).includes(group._id)) {
							const ind = group.metrics.map(met => met._id).indexOf(metric._id);
							expect(ind).to.be.greaterThan(-1);
							expect(group.metrics[ind]).to.be.an('object');
							expect(group.metrics[ind]).to.haveOwnProperty('name');
							expect(group.metrics[ind].name).to.be.equal(metric.name);
							expect(group.metrics[ind]).to.haveOwnProperty('description');
							expect(group.metrics[ind].description).to.be.equal(metric.description);
							expect(group.metrics[ind]).to.haveOwnProperty('isRequired');
							expect(group.metrics[ind].isRequired).to.be.equal(metric.isRequired);
							expect(group.metrics[ind]).to.haveOwnProperty('dataType');
							expect(group.metrics[ind].dataType).to.be.equal(metric.dataType);
						}
					});
				});
			});
		});
	});

	it('deleteMany', () => {
		return axios.deleteMany(url, {
			data: metrics.map(elem => {
				return {
					_id: elem._id,
					groups: elem.groups.map(item => item._id)
				};
			}),
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

			axios.getMany('http://localhost:4200/api/metric-group', {
				headers: {
					Authorization: `Bearer ${tokenObj.token}`,
				}
			}).then(response2 => {
				metrics.forEach(metric => {
					response2.forEach(group => {
						if (metrics.groups.map(grp => grp._id).includes(group._id)) {
							expect(group.metrics.map(met => met._id)).to.not.include(metric._id);
						}
					});
				});
			});

			metrics = [];
		});
	});

	it('insertOne', () => {
		const metric = generateMetrics(1)[0];
		return axios.insertOne(url, metric, {
			headers: {
				Authorization: `Bearer ${tokenObj.token}`
			}
		}).then(response => {
			expect(response).to.be.an('array');
			expect(response).to.have.lengthOf(2);
			expect(response[0]).to.be.an('object');
			Object.keys(metric).forEach(key => {
				if (!(metric[key] instanceof Object) && !(metric[key] instanceof Array)) {
					expect(response[0]).to.have.haveOwnProperty(key);
					expect(response[0][key]).to.be.equal(metric[key]);
				}
			});

			expect(response[0]).to.haveOwnProperty('groups');
			expect(response[0].groups).to.have.lengthOf(metric.groups.length);
			response[0].groups.forEach((group, j) => {
				expect(group).to.be.an('object');
				Object.keys(metric.groups[j]).forEach(key => {
					expect(metric.groups[j][key]).to.be.equal(group[key]);
				});
			});

			expect(response[1]).to.be.an('object');
			expect(response[1]).to.haveOwnProperty('nModified');
			expect(response[1].nModified).to.be.equal(response[0].groups.length);

			axios.getMany('http://localhost:4200/api/metric-group', {
				headers: {
					Authorization: `Bearer ${tokenObj.token}`,
				}
			}).then(response2 => {
				response2.forEach(group => {
					if (response[0].groups.map(group2 => group2._id).includes(group._id)) {
						const ind = group.metrics.map(met => met._id).indexOf(response[0]._id);
						expect(ind).to.be.greaterThan(-1);
						expect(group.metrics[ind]).to.be.an('object');
						expect(group.metrics[ind]).to.haveOwnProperty('name');
						expect(group.metrics[ind].name).to.be.equal(response[0].name);
						expect(group.metrics[ind]).to.haveOwnProperty('description');
						expect(group.metrics[ind].description).to.be.equal(response[0].description);
						expect(group.metrics[ind]).to.haveOwnProperty('isRequired');
						expect(group.metrics[ind].isRequired).to.be.equal(response[0].isRequired);
						expect(group.metrics[ind]).to.haveOwnProperty('dataType');
						expect(group.metrics[ind].dataType).to.be.equal(response[0].dataType);
					}
				});
			});

			metrics = [...metrics, response[0]];
		});
	});

	it('getOne', () => {
		return axios.getOne(url, metrics[0]._id, {
			headers: {
				Authorization: `Bearer ${tokenObj.token}`,
			}
		}).then(response => {
			expect(response).to.be.an('object');
			expect(response).to.haveOwnProperty('_id');
			expect(response._id).to.be.equal(metrics[0]._id);
			expect(response).to.haveOwnProperty('groups');
			response.groups.forEach((group, i) => {
				expect(group).to.be.an('object');
				expect(group).to.haveOwnProperty('_id');
				expect(group._id).to.be.equal(groups[i]._id);
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

			axios.getMany('http://localhost:4200/api/metric-group', {
				headers: {
					Authorization: `Bearer ${tokenObj.token}`,
				}
			}).then(response2 => {
				response2.forEach(group => {
					if (metrics[0].groups.map(group2 => group2._id).includes(group._id)) {
						const ind = group.metrics.map(metric => metric._id).indexOf(metrics[0]._id);
						expect(ind).to.be.greaterThan(-1);
						expect(group.metrics[ind]).to.be.an('object');
						expect(group.metrics[ind]).to.haveOwnProperty('name');
						expect(group.metrics[ind].name).to.be.equal(metrics[0].name);
						expect(group.metrics[ind]).to.haveOwnProperty('description');
						expect(group.metrics[ind].description).to.be.equal(metrics[0].description);
						expect(group.metrics[ind]).to.haveOwnProperty('isRequired');
						expect(group.metrics[ind].isRequired).to.be.equal(metrics[0].isRequired);
						expect(group.metrics[ind]).to.haveOwnProperty('dataType');
						expect(group.metrics[ind].dataType).to.be.equal(metrics[0].dataType);
					}
				});
			});
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

			axios.getMany('http://localhost:4200/api/metric-group', {
				headers: {
					Authorization: `Bearer ${tokenObj.token}`,
				}
			}).then(response2 => {
				response2.forEach(group => {
					if (metrics[0].groups.map(grp => grp._id).includes(group._id)) {
						expect(group.metrics.map(met => met._id)).to.not.include(metrics[0]._id);
					}
				});

				metrics.pop();
			});
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
			groups: [groups[0]],
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
	let count = 0;

	let uniques = {};
	metrics.map(metric => metric.groups.map(group => group._id)).forEach(idSet => {
		idSet.forEach(id => {
			uniques[id] = true;
		});
	});

	count += Object.keys(uniques).length;

	uniques = {};
	if (removedGroups) {
		removedGroups.forEach(idSet => {
			idSet.forEach(id => {
				uniques[id] = true;
			});
		});
	}

	count += Object.keys(uniques).length;

	return count;
}

/**
 * updates all metrics.
 * @returns changes array.
 */
function updateMetrics(metrics, withIds) {
	metrics[0].dataType = 'boolean';
	metrics[0].name += ' updated';
	metrics[0].groups = [...metrics[0].groups, groups[1]];
	metrics[0].stringParams.minLength = 3;

	const changes = [{
		dataType: metrics[0].dataType,
		name: metrics[0].name,
		description: metrics[0].description,
		isRequired: metrics[0].isRequired,
		removedGroups: [],
		groups: metrics[0].groups,
		stringParams: {
			minLength: metrics[0].stringParams.minLength
		}
	}];

	if (withIds === true) {
		changes[0]._id = metrics[0]._id;
	}

	if (metrics.length > 1) {
		metrics[1].name += ' updated';
		metrics[1].isRequired = !metrics[1].isRequired;
		metrics[1].description = 'now its required!';
		metrics[1].groups = [groups[1]];

		changes.push({
			name: metrics[1].name,
			description: metrics[1].description,
			isRequired: metrics[1].isRequired,
			dataType: metrics[1].dataType,
			removedGroups: [groups[0]._id],
			groups: metrics[1].groups,
		});

		if (withIds === true) {
			changes[1]._id = metrics[1]._id;
		}
	}

	return changes;
}
