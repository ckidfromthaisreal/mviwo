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

describe('metric.controller.js', () => {
    // beforeEach(() => {
    //   nock('http://localhost:8080').get('/metric').reply(200, response);
    // });

    // it('getMany populate', () => {
    //     return getMany({ headers: { 'groupspopulate': true, 'groupsselect': 'name'}}).then(response => {
    //       expect(typeof response).to.equal('object');
    //       expect(response.length > 0);
    //       expect(typeof response[0]).to.equal('object');
    //     });
    // });

    // it('getMany dont-populate', () => {
    //   return getMany({ headers: { 'groupspopulate': false}}).then(response => {
    //     expect(typeof response).to.equal('object');
    //     expect(response.length > 0);
    //     expect(typeof response[0]).to.equal('object');
    //   });
    // });

    // it('getMany filtered', () => {
    //   return getMany({
    //     headers: {
    //       'groupspopulate': true,
    //       'groupsselect': 'isMandatory',
    //       'filter': '{ "_id": "5ac635872647e02fa41c3bde"}'
    //     }
    //   }).then(response => {
    //     expect(typeof response).to.equal('object');
    //     expect(response.length > 0);
    //     expect(typeof response[0]).to.equal('object');
    //     // console.log(JSON.stringify(response[0]));
    //   });
    // });

    // it('getOne populate', () => {
    //   return getOne('5ac635872647e02fa41c3bde', {
    //     headers: {
    //       'groupspopulate': true,
    //       'groupsselect': 'isMandatory'
    //     }
    //   }).then(response => {
    //     expect(typeof response).to.equals('object');
    //     // console.log(JSON.stringify(response));
    //   });
    // });

    // it('getOne dont-populate', () => {
    //   return getOne('5ac635872647e02fa41c3bde', {
    //     headers: {
    //       'groupspopulate': false
    //     }
    //   }).then(response => {
    //     expect(typeof response).to.equals('object');
    //     // console.log(JSON.stringify(response));
    //   });
    // });

    // it('insertMany', function() {
    //   const num = 5;
    //   this.timeout(Number.POSITIVE_INFINITY);
    //   return insertMany({
    //     resources: generateMetrics(num)
    //   }).then(response => {
    //     expect(typeof response).to.equals('object');
    //     expect(response.length === num);
    //   });
    // });

    it('insertOne', () => {
        return insertOne({
            resources: generateMetrics(1)[0]
        }).then(response => {
            expect(response).to.be.an('object');
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
