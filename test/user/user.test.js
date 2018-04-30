/*
testing module for user.controller.js
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
const url = 'http://localhost:4200/api/user';

describe('user.controller.js', () => {

	it('register', () => {
		return axios.insertMany(`${url}/register`, {
			username: 'mviwo-overlord',
			email: 'igalklebanov@gmail.com',
			password: 'comeatme',
		}).then(response => {
			expect(response).to.be.an('object');
			console.log(response);
		});
	});

	it('login', () => {
		return axios.insertMany(`${url}/login`, {
			login: 'igalklebanov@gmail.com',
			password: 'comeatme'
		}).then(response => {
			expect(response).to.be.an('object');
			expect(response).to.haveOwnProperty('token');
			console.log(response);
		});
	});

	// it('delete', () => {
	// 	return axios.deleteMany(url, {
	// 		data: {
	// 			username: 'mviwo-overlord'
	// 		}
	// 	}).then(response => {
	// 		expect(response).to.be.an('object');
	// 		expect(response).to.haveOwnProperty('n');
	// 		expect(response.n).to.be.equal(1);
	// 	});
	// });
});
