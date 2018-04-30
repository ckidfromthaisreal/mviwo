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
	const user = {
		username: 'test000',
		email: 'igalklebanov@gmail.com',
		password: 'comeatmebruh'
	};

	let tokenObj;

	it('register', () => {
		return axios.insertMany(`${url}/register`, user).then(response => {
			expect(response).to.be.an('object');
			expect(response).to.haveOwnProperty('token');
		});
	});

	it('login', () => {
		return axios.insertMany(`${url}/login`, {
			login: user.username,
			password: user.password
		}).then(response => {
			expect(response).to.be.an('object');
			expect(response).to.haveOwnProperty('token');
			tokenObj = response;
		});
	});

	it('delete', () => {
		return axios.deleteMany(url, {
			data: {
				username: user.username
			},
			headers: {
				Authorization: `Bearer ${tokenObj.token}`
			}
		}).then(response => {
			expect(response).to.be.an('object');
			expect(response).to.haveOwnProperty('n');
			expect(response.n).to.be.equal(1);
		});
	});
});
