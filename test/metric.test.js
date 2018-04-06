import {
    deleteMany
} from '../server/controller/metric/metric.controller';

/*
testing module for metric.controller.js
*/

/** http://www.chaijs.com/
 * chai is a BDD/TDD assertion library for node and the browser that can be
 * delightfully paired with any javascript testing framework. chai has several
 * interfaces that allow the developer to choose the most comfortable.
 */
const expect = require('chai').expect;

/** https://github.com/axios/axios
 * promise based HTTP client for the browser and node.js.
 */
const axios = require('axios');

/** https://github.com/node-nock/nock
 * nock is an HTTP mocking and expectations library for node.js.
 * nock can be used to test modules that peform HTTP requests in isolation.
 * for instance, if a module performs HTTP requests to a couchdb server or
 * makes HTTP requests to the amazon API, you can test that module in isolation.
 */
// const nock = require('nock');

/** metric api url. */
const url = 'http://localhost:4200/api/metric';

/**
 * sends a http get request to api to perform getMany.
 * @param {any} options
 * @returns promise.
 */
function getMany(options) {
    return axios.get('http://localhost:4200/api/metric', options)
        .then(res => res.data)
        .catch(error => console.log(error));
}

/**
 * sends a http get request to api to perform getOne.
 * @param {any} id id of requested metric.
 * @param {any} options
 * @returns promise.
 */
function getOne(id, options) {
    return axios.get(`http://localhost:4200/api/metric/${id}`, options)
        .then(res => res.data)
        .catch(error => console.log(error));
}

/**
 * sends a http post request to api to perform insertMany.
 * @param {any} data data to be inserted.
 * @returns promise.
 */
function insertMany(data) {
    return axios.post('http://localhost:4200/api/metric', data)
        .then(res => res.data)
        .catch(error => console.log(error));
}

/**
 * sends a http post request to api to perform insertOne.
 * @param {any} data data to be inserted.
 * @returns promise.
 */
function insertOne(data) {
    return axios.post('http://localhost:4200/api/metric/1', data)
        .then(res => res.data)
        .catch(error => console.log(error));
}

/**
 * sends a http delete request to api to perform deleteOne.
 * @param {any} id metric id to be deleted.
 * @returns promise.
 */
function deleteOne(id, data) {
    return axios.delete(`http://localhost:4200/api/metric/${id}`, data)
        .then(res => res.data)
        .catch(error => console.log(error));
}

describe('metric.controller.js', () => {
    const metrics = [];
    // beforeEach(() => {
    //   nock('http://localhost:8080').get('/metric').reply(200, response);
    // });

    it('getMany populate', () => {
        return getMany({
            headers: {
                'groupspopulate': true,
                'groupsselect': 'isMandatory'
            }
        }).then(response => {
            expect(response).to.be.an('object');
            expect(response).to.have.lengthOf.at.least(1);
            response.forEach(metric => {
                expect(metric).to.be.an('object');
                expect(metric).to.haveOwnProperty('groups');
                metric.groups.forEach(group => {
                    expect(group).to.be.an('object');
                    expect(group).to.haveOwnProperty('isMandatory');
                });
            });
        });
    });

    it('getMany', () => {
        return getMany().then(response => {
            expect(response).to.be.an('object');
            expect(response).to.have.lengthOf.at.least(1);
            response.forEach(metric => {
                expect(metric).to.be.an('object');
                expect(metric).to.haveOwnProperty('groups');
                metric.groups.forEach(group => {
                    expect(group).to.be.an('object');
                    expect(group).to.not.haveOwnProperty('isMandatory');
                });
            });
        });
    });

    it('getMany filtered', () => {
        const id = '5ac635872647e02fa41c3bde';
        return getMany({
            headers: {
                'filter': `{ "_id": "${id}"}`
            }
        }).then(response => {
            expect(response).to.be.an('object');
            expect(response).to.have.lengthOf(1);
            expect(response[0]).to.be.an('object');
            expect(response[0]).to.haveOwnProperty('_id');
            expect(response[0]._id).to.be.equal(id);
        });
    });

    it('getOne populate', () => {
        const id = '5ac635872647e02fa41c3bde';
        return getOne(id, {
            headers: {
                'groupspopulate': true,
                'groupsselect': 'isMandatory'
            }
        }).then(response => {
            expect(response).to.be.an('object');
            expect(response).to.haveOwnProperty('_id');
            expect(response._id).to.be.equal(id);
            expect(response).to.haveOwnProperty('groups');
            response.groups.forEach(group => {
                expect(group).to.be.an('object');
                expect(group).to.haveOwnProperty('isMandatory');
            });
        });
    });

    it('getOne', () => {
        const id = '5ac635872647e02fa41c3bde';
        return getOne(id).then(response => {
            expect(response).to.be.an('object');
            expect(response).to.haveOwnProperty('_id');
            expect(response._id).to.be.equal(id);
            expect(response).to.haveOwnProperty('groups');
            response.groups.forEach(group => {
                expect(group).to.be.an('object');
                expect(group).to.not.haveOwnProperty('isMandatory');
            });
        });
    });

    it('insertMany', () => {
        const num = 5;
        return insertMany({
            resources: generateMetrics(num)
        }).then(response => {
            expect(response).to.be.an('array');
            expect(response).to.have.lengthOf(2);
            expect(response[0]).to.be.an('object');
            expect(resonse[0]).to.have.lengthOf(num);
            expect(response[1]).to.be.an('object');
            expect(response[1]).to.haveOwnProperty('nModified');
            expect(response[1].nModified).to.be.equal(uniqueGroups(response[0]));
            metrics.push(response[0]);
        });
    });

    it('deleteMany', () => {
        return deleteMany(metrics).then(response => {
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
        return insertOne({
            resources: generateMetrics(1)[0]
        }).then(response => {
            expect(response).to.be.an('array');
            expect(response).to.have.lenghtOf(2);
            expect(response[0]).to.be.an('object');
            expect(response[0]).to.haveOwnProperty('groups');
            expect(response[0].groups).to.be.an('array');
            expect(response[1]).to.be.an('object');
            expect(response[1].nModified).to.be.equal(response[0].groups.length);
            metrics.push(response);
        });
    });

    it('deleteOne', () => {
        return deleteOne(metrics[0]._id, {
            data: {
                groups: metrics[0].groups.map(group => group._id)
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
            lastUpdate: Date.now,
            groups: [{
                _id: '5ac6a8e32647e02fa41c3be1',
                name: 'test',
                description: 'ignore me!'
            }]
        });
    }

    return metrics;
}

function uniqueGroups(metrics) {
    let uniques = {};
    metrics.map(metric => metric.groups.map(group => group._id))
        .forEach(idSet => {
            idSet.forEach(id => {
                uniques[id] = true;
            });
        });

    return Object.keys(uniques).length;
}
