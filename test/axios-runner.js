/** https://github.com/axios/axios
 * promise based HTTP client for the browser and node.js.
 */
const axios = require('axios');

/**
 * sends a http get request to api to perform getMany.
 * @param {any} config
 * @returns promise.
 */
module.exports.getMany = (url, config) => {
	return axios.get(url, config)
		.then(res => res.data)
		.catch(error => console.log(error));
};

/**
 * sends a http get request to api to perform getOne.
 * @param {any} id id of requested metric.
 * @param {any} options
 * @returns promise.
 */
module.exports.getOne = (url, id, config) => {
	return axios.get(`${url}/${id}`, config)
		.then(res => res.data)
		.catch(error => console.log(error));
};

/**
 * sends a http post request to api to perform insertMany.
 * @param {any} data data to be inserted.
 * @returns promise.
 */
module.exports.insertMany = (url, data, config) => {
	return axios.post(url, data, config)
		.then(res => res.data)
		.catch(error => console.log(error));
};

/**
 * sends a http post request to api to perform insertOne.
 * @param {any} data data to be inserted.
 * @returns promise.
 */
module.exports.insertOne = (url, data, config) => {
	return axios.post(`${url}/1`, data, config)
		.then(res => res.data)
		.catch(error => console.log(error));
};

/**
 * sends a http delete request to api to perform deleteOne.
 * @param {any} id metric id to be deleted.
 * @returns promise.
 */
module.exports.deleteOne = (url, id, config) => {
	return axios.delete(`${url}/${id}`, config)
		.then(res => res.data)
		.catch(error => console.log(error));
};

/**
 * sends a http delete request to api to perform deleteMany.
 * @param {any} data data to be deleted.
 * @returns promise.
 */
module.exports.deleteMany = (url, config) => {
	return axios.delete(url, config)
		.then(res => res.data)
		.catch(error => console.log(error));
};

/**
 * sends a http request to api to perform updateOne.
 * @param {*} id metric id.
 * @param {*} data changes made.
 */
module.exports.updateOne = (url, id, data, config) => {
	return axios.patch(`${url}/${id}`, data, config)
		.then(res => res.data)
		.catch(error => console.log(error));
};

/**
 * sends a http request to api to perform updateMany.
 * @param {*} data changes made.
 */
module.exports.updateMany = (url, data, config) => {
	return axios.patch(url, data, config)
		.then(res => res.data)
		.catch(error => console.log(error));
};
