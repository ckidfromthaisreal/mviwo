/** jwt middleware */
const jwt = require('express-jwt');

/** secret. */
const SECRET = require('./secret').secret;

/** auth config object */
exports.config = {
	TOKEN_SECRET: SECRET,
	EXPIRATION_DAYS: 7,
};

exports.jwt = jwt({
	secret: SECRET
});
