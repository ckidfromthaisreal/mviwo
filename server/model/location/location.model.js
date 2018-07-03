/*
location model.
*/

/** server config file. */
const config = require('../../server.json');

/** http://mongoosejs.com/
  mongoose provides a straight-forward, schema-based solution to model your application data.
  it includes built-in type casting, validation, query building, business logic hooks and more,
  out of the box.
*/
const mongoose = require('mongoose').set('debug', config.DEBUG_MONGOOSE);

const patientEmbeddedSchema = new mongoose.Schema({
	_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Patient',
		auto: false,
		required: true,
	},
	uid: {
		type: String,
		required: true
	},
	firstName: {
		type: String,
		required: true
	},
	lastName: {
		type: String,
		required: true
	},
	dateOfBirth: {
		type: Date
	},
	isFemale: {
		type: Boolean,
		required: true
	}
});

const locationSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	country: {
		type: String,
		required: true
	},
	address: {
		type: String
	},
	patients: {
		type: [patientEmbeddedSchema],
		required: true
	}
}, { timestamps: true });

/* export model. */
module.exports = mongoose.model('Location', locationSchema);
