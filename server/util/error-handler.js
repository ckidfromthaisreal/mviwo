/** server config file. */
const config = require('../server.json');

/** custom logger module. */
const logger = require('./logger');

/**
custom-made "catch-all" error handler.
http://expressjs.com/en/guide/error-handling.html
*/
module.exports = (err, req, res, next) => {
	/* delegate to the default error handling mechanisms when
	the headers have already been sent to the client.
	the default error handler closes the connection and fails the request.
	*/
	if (res.headersSent) {
		return next(err);
	}

	/** error object to be sent to client.
	 * config.ENVIRONMENT = 'development' sends stacktrace.
	 */
	const errObj = {
		error: config.ENVIRONMENT === 'development' ? err : {},
		message: err.message
	};

	if (err.code === 'permission_denied') {
		res.status(403);
		logger.error('AUTH', determineRequest(req), determineMessage(err, req));
	} else {
		res.status(err.status || 500);
	}

	if (config.USE_VIEW_ENGINE) {
		res.render('error', errObj);
	} else {
		res.json(errObj);
	}
};

/**
 * @param {*} req http request.
 * @returns string in format: 'method(route)'
 */
function determineRequest(req) {
	return `${req.method}(${req.path})`;
}

/**
 * @param {*} err error object.
 * @param {*} req http request.
 * @returns string in format 'errormsg for user: userObj'
 */
function determineMessage(err, req) {
	return `${err.message} for user: ${JSON.stringify(req.user)}`;
}
