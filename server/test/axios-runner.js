/** https://github.com/axios/axios
 * promise based HTTP client for the browser and node.js.
 */
const axios = require('axios');

/**
 * sends a http get request to api to perform getMany.
 * @param {any} options
 * @returns promise.
 */
module.exports.getMany = (url, options) => {
	return axios.get(url, options)
		.then(res => res.data)
		.catch(error => console.log(error));
};

/**
 * sends a http get request to api to perform getOne.
 * @param {any} id id of requested metric.
 * @param {any} options
 * @returns promise.
 */
module.exports.getOne = (url, id, options) => {
	return axios.get(`${url}/${id}`, options)
		.then(res => res.data)
		.catch(error => console.log(error));
};

/**
 * sends a http post request to api to perform insertMany.
 * @param {any} data data to be inserted.
 * @returns promise.
 */
module.exports.insertMany = (url, data) => {
	return axios.post(url, data)
		.then(res => res.data)
		.catch(error => console.log(error));
};

/**
 * sends a http post request to api to perform insertOne.
 * @param {any} data data to be inserted.
 * @returns promise.
 */
module.exports.insertOne = (url, data) => {
	return axios.post(`${url}/1`, data)
		.then(res => res.data)
		.catch(error => console.log(error));
};

/**
 * sends a http delete request to api to perform deleteOne.
 * @param {any} id metric id to be deleted.
 * @returns promise.
 */
module.exports.deleteOne = (url, id, data) => {
	return axios.delete(`${url}/${id}`, data)
		.then(res => res.data)
		.catch(error => console.log(error));
};

/**
 * sends a http delete request to api to perform deleteMany.
 * @param {any} data data to be deleted.
 * @returns promise.
 */
module.exports.deleteMany = (url, data) => {
	return axios.delete(url, data)
		.then(res => res.data)
		.catch(error => console.log(error));
};

/**
 * sends a http request to api to perform updateOne.
 * @param {*} id metric id.
 * @param {*} data changes made.
 */
module.exports.updateOne = (url, id, data) => {
	return axios.patch(`${url}/${id}`, data)
		.then(res => res.data)
		.catch(error => console.log(error));
};

/**
 * sends a http request to api to perform updateMany.
 * @param {*} data changes made.
 */
module.exports.updateMany = (url, data) => {
	return axios.patch(url, data)
		.then(res => res.data)
		.catch(error => console.log(error));
};
