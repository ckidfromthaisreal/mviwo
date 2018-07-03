/*
patient model.
*/

/** server config file. */
const config = require('../../server.json');

/**
 * https://github.com/crypto-utils/uid-safe
 * Create cryptographically secure UIDs safe for both cookie and URL usage.
*/
const uid = require('uid-safe');

/** http://mongoosejs.com/
  mongoose provides a straight-forward, schema-based solution to model your application data.
  it includes built-in type casting, validation, query building, business logic hooks and more,
  out of the box.
*/
const mongoose = require('mongoose').set('debug', config.DEBUG_MONGOOSE);

const locationEmbeddedSchema = new mongoose.Schema({
	_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Location',
		auto: false,
		required: true,
	},
	name: {
		type: String,
		required: true
	},
	country: {
		type: String,
		required: true
	}
});

const patientSchema = new mongoose.Schema({
	uid: {
		type: String,
		// required: true,
		unique: true,
		default: () => { return uid.sync(6); }
	},
	firstName: {
		type: String,
		required: true
	},
	middleName: {
		type: String
	},
	lastName: {
		type: String,
		required: true
	},
	fatherName: {
		type: String
	},
	motherName: {
		type: String
	},
	dateOfBirth: {
		type: Date
	},
	placeOfBirth: {
		type: String
	},
	isFemale: {
		type: Boolean,
		required: true
	},
	job: {
		type: String
	},
	// picture: {
	// 	type: String
	// },
	locations: {
		type: [locationEmbeddedSchema],
		required: true
	}
}, { timestamps: true });

// patientSchema.pre('save', function (next) {
	// const patient = this;
	// if (!patient.uid) {
	// 	patient.uid = uid.sync(8);
	// }
	// return next();
// });

/* export model. */
module.exports = mongoose.model('Patient', patientSchema);
