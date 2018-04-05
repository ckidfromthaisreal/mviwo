const expect = require('chai').expect;
const axios = require('axios');
const nock = require('nock');
const FormData = require('form-data');

function getMany(options) {
  return axios.get('http://localhost:4200/api/metric', options)
              .then(res => res.data)
              .catch(error => console.log(error));
}

function getOne(id, options) {
  return axios.get(`http://localhost:4200/api/metric/${id}`, options)
              .then(res => res.data)
              .catch(error => console.log(error));
}

describe('metric.controller.js', () => {
  // beforeEach(() => {
  //   nock('http://localhost:8080').get('/metric').reply(200, response);
  // });

  it('getMany populate', () => {
      return getMany({ headers: { 'groupspopulate': true, 'groupsselect': 'name'}}).then(response => {
        expect(typeof response).to.equal('object');
        expect(response.length > 0);
        expect(typeof response[0]).to.equal('object');
      });
  });

  it('getMany dont-populate', () => {
    return getMany({ headers: { 'groupspopulate': false}}).then(response => {
      expect(typeof response).to.equal('object');
      expect(response.length > 0);
      expect(typeof response[0]).to.equal('object');
    });
});

  it('getMany filtered', () => {
    return getMany({
      headers: {
        'groupspopulate': true,
        'groupsselect': 'isMandatory',
        'filter': '{ "_id": "5ac635872647e02fa41c3bde"}'
      }
    }).then(response => {
      expect(typeof response).to.equal('object');
      expect(response.length > 0);
      expect(typeof response[0]).to.equal('object');
      // console.log(JSON.stringify(response[0]));
    });
  });

  it('getOne populate', () => {
    return getOne('5ac635872647e02fa41c3bde', {
      headers: {
        'groupspopulate': true,
        'groupsselect': 'isMandatory'
      }
    }).then(response => {
      expect(typeof response).to.equals('object');
      // console.log(JSON.stringify(response));
    });
  });

  it('getOne dont-populate', () => {
    return getOne('5ac635872647e02fa41c3bde', {
      headers: {
        'groupspopulate': false
      }
    }).then(response => {
      expect(typeof response).to.equals('object');
      // console.log(JSON.stringify(response));
    });
  });
});
