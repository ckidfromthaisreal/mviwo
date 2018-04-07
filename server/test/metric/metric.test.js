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
    return axios.get(url, options)
        .then(res => res.data)
        .catch(error => console.log(error.data));
}

/**
 * sends a http get request to api to perform getOne.
 * @param {any} id id of requested metric.
 * @param {any} options
 * @returns promise.
 */
function getOne(id, options) {
    return axios.get(`${url}/${id}`, options)
        .then(res => res.data)
        .catch(error => console.log(error.data));
}

/**
 * sends a http post request to api to perform insertMany.
 * @param {any} data data to be inserted.
 * @returns promise.
 */
function insertMany(data) {
    return axios.post(url, data)
        .then(res => res.data)
        .catch(error => console.log(error));
}

/**
 * sends a http post request to api to perform insertOne.
 * @param {any} data data to be inserted.
 * @returns promise.
 */
function insertOne(data) {
    return axios.post(`${url}/1`, data)
        .then(res => res.data)
        .catch(error => console.log(error));
}

/**
 * sends a http delete request to api to perform deleteOne.
 * @param {any} id metric id to be deleted.
 * @returns promise.
 */
function deleteOne(id, data) {
    return axios.delete(`${url}/${id}`, data)
        .then(res => res.data)
        .catch(error => console.log(error));
}

/**
 * sends a http delete request to api to perform deleteMany.
 * @param {any} data data to be deleted.
 * @returns promise.
 */
function deleteMany(data) {
    return axios.delete(url, data)
        .then(res => res.data)
        .catch(error => console.log(error));
}

/**
 * sends a http request to api to perform updateOne.
 * @param {*} id metric id.
 * @param {*} data changes made.
 */
function updateOne(id, data) {
    return axios.patch(`${url}/${id}`, data)
        .then(res => res.data)
        .catch(error => console.log(error));
}

describe('metric.controller.js', () => {
    let metrics = [];
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
            expect(response).to.be.an('array');
            expect(response).to.have.lengthOf.at.least(1);
            response.forEach(metric => {
                expect(metric).to.be.an('object');
                expect(metric).to.haveOwnProperty('groups');
                // metric.groups.forEach(group => {
                //     expect(group).to.be.an('object');
                //     expect(group).to.haveOwnProperty('isMandatory');
                // });
            });
        });
    });

    it('getMany', () => {
        return getMany().then(response => {
            expect(response).to.be.an('array');
            expect(response).to.have.lengthOf.at.least(1);
            response.forEach(metric => {
                expect(metric).to.be.an('object');
                expect(metric).to.haveOwnProperty('groups');
                // metric.groups.forEach(group => {
                //     expect(group).to.be.an('object');
                //     expect(group).to.not.haveOwnProperty('isMandatory');
                // });
            });
        });
    });

    it('getMany filtered', () => {
        const id = '5aae7b7bee86ef0014fd2d62';
        return getMany({
            headers: {
                'filter': `{ "_id": "${id}"}`
            }
        }).then(response => {
            expect(response).to.be.an('array');
            expect(response).to.have.lengthOf(1);
            expect(response[0]).to.be.an('object');
            expect(response[0]).to.haveOwnProperty('_id');
            expect(response[0]._id).to.be.equal(id);
        });
    });

    it('getOne populate', () => {
        const id = '5aae7b7bee86ef0014fd2d62';
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
            // response.groups.forEach(group => {
            //     expect(group).to.be.an('object');
            //     expect(group).to.haveOwnProperty('isMandatory');
            // });
        });
    });

    it('getOne', () => {
        const id = '5aae7b7bee86ef0014fd2d62';
        return getOne(id).then(response => {
            expect(response).to.be.an('object');
            expect(response).to.haveOwnProperty('_id');
            expect(response._id).to.be.equal(id);
            expect(response).to.haveOwnProperty('groups');
            // response.groups.forEach(group => {
            //     expect(group).to.be.an('object');
            //     expect(group).to.not.haveOwnProperty('isMandatory');
            // });
        });
    });

    it('insertMany', () => {
        const num = 2;
        return insertMany({
            resources: generateMetrics(num)
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

    it('deleteMany', () => {
        return deleteMany({
            data: {
                resources: metrics
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
        return insertOne({
            resources: generateMetrics(1)[0]
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

    it('updateOne', () => {
        const nuDataType = 'boolean';
        const nuName = 'test 000000';
        const removedGroup = '5ac6a8e32647e02fa41c3be1';
        const addedGroup = {
            _id: '5ac8d04cd8cd663ecc7d0f16',
            name: 'test1',
            description: 'ignore me!'
        };
        const stringParams = {
            minLength: 3
        };
        return updateOne(metrics[0]._id, {
                resources: {
                    dataType: nuDataType,
                    name: nuName,
                    groups: [addedGroup],
                    removedGroups: [removedGroup],
                    stringParams: stringParams
                }
            })
            .then(response => {
                expect(response).to.be.an('array');
                expect(response).to.have.lengthOf(2);
                expect(response[0]).to.be.an('object');
                expect(response[0]).to.haveOwnProperty('dataType');
                expect(response[0].dataType).to.be.equal(nuDataType);
                expect(response[0]).to.haveOwnProperty('name');
                expect(response[0].name).to.be.equal(nuName);
                expect(response[0]).to.haveOwnProperty('groups');
                expect(response[0].groups).to.be.an('array');
                expect(response[0].groups).to.have.lengthOf(1);
                expect(response[0].groups[0]).to.be.an('object');
                Object.keys(addedGroup).forEach(key => {
                    expect(response[0].groups[0]).to.haveOwnProperty(key);
                    expect(response[0].groups[0][key]).to.be.equal(addedGroup[key]);
                });
                expect(response[1]).to.be.an('object');
                expect(response[1]).to.haveOwnProperty('nModified');
                expect(response[1].nModified).to.be.equal(2);
                metrics[0].groups = [addedGroup];
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
                name: 'test0',
                description: 'ignore me!'
            }],
            stringParams: {
                isEmail: false,
                lineBreaks: false,
                hint: 'just write something ffs'
            }
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
