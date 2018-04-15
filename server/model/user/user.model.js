/** server's auth config file. */
const auth = require('../../auth');

/** http://mongoosejs.com/
  mongoose provides a straight-forward, schema-based solution to model your application data.
  it includes built-in type casting, validation, query building, business logic hooks and more,
  out of the box.
*/
const mongoose = require('mongoose');

/** https://github.com/kelektiv/node.bcrypt.js
 * lib to help you hash password.
 */
const bcrypt = require('bcrypt');

/** https://github.com/auth0/node-jsonwebtoken
 * An implementation of JSON web tokens. this was developed against
 * draft-ietf-oauth-json-web-token-08.
 */
const jwt = require('jsonwebtoken');

/**
 * server permissions file.
 */
const permissions = require('../../permission.json');

/** profile sub-schema. */
const profileSchema = new mongoose.Schema({
	_id: {
		auto: false
	},
	first: {
		type: String
	},
	last: {
		type: String
	},
	title: {
		type: String
	},
	dob: {
		type: Date,
		max: Date.now
	}
});

/** main user schema. */
const userSchema = new mongoose.Schema({
	email: {
		type: String,
		unique: true,
		required: true,
		trim: true
	},
	username: {
		type: String,
		unique: true,
		required: true,
		trim: true
	},
	password: {
		type: String,
		required: true,
		minlength: 8
	},
	power: {
		type: Number,
		required: true,
		min: 0,
		max: 999,
		default: 0
	},
	profile: {
		type: profileSchema
	},
	created: {
		type: Number,
		required: true,
		default: new Date().getTime(),
		max: new Date().getTime()
	},
	lastUpdated: {
		type: Date
	}
});

/* runs before saving document to collection and saves a crypted password. */
userSchema.pre('save', function (next) {
	const user = this;
	bcrypt.hash(user.password, 10, (err, hash) => {
		if (err) {
			return next(err);
		}

		user.password = hash;
		return next();
	});
});

// const User = mongoose.model('User', userSchema);

/**
 * authenticate user login details.
 * @param {*} login email or username.
 * @param {*} password user password (pre hash).
 * @param {*} callback (err, user)
 */
// userSchema.statics.authenticate = async (login, password, callback) => {
// let user;

// try {
// 	user = User.findOne({$or: [{ email: login }, { username: login }]}).exec();
// } catch (err) {
// 	return callback(err);
// }

// if (!user) {
// 	const err = new Error('user not found');
// 	err.status = 401;
// 	return callback(err);
// }

// try {
// 	if (await !bcrypt.compare(password, user.password)) {
// 		const err = new Error('wrong password');
// 		err.status = 401;
// 		callback(err);
// 	}
// } catch (err) {
// 	return callback(err);
// }

// callback(null, user);
// };

/**
 * creates a JWT (Json Web Token) for given user.
 * @returns user's JWT.
 */
userSchema.methods.generateJwt = function () {
	const expiry = new Date();
	expiry.setDate(expiry.getDate() + auth.config.EXPIRATION_DAYS);

	const perm = permissions[String(this.power)].allowed;

	return jwt.sign({
		_id: this._id,
		email: this.email,
		username: this.username,
		permissions: perm,
		exp: parseInt(expiry.getTime() / 1000)
	}, auth.config.TOKEN_SECRET);
};

module.exports = mongoose.model('User', userSchema);
