/*
session model.
*/

/** server config file. */
const config = require('../../server.json');

/** http://mongoosejs.com/
  mongoose provides a straight-forward, schema-based solution to model your application data.
  it includes built-in type casting, validation, query building, business logic hooks and more,
  out of the box.
*/
const mongoose = require('mongoose').set('debug', config.DEBUG_MONGOOSE);

// const patientEmbeddedSchema = new mongoose.Schema({
// 	_id: {
// 		type: mongoose.Schema.Types.ObjectId,
// 		ref: 'Patient',
// 		auto: false,
// 		required: true
// 	},
// 	uid: {
// 		type: String,
// 		required: true
// 	},
// 	firstName: {
// 		type: String,
// 		required: true
// 	},
// 	lastName: {
// 		type: String,
// 		required: true
// 	},
// 	isFemale: {
// 		type: Boolean,
// 		required: true
// 	},
// 	dateOfBirth: {
// 		type: Date
// 	}
// });

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
	// , patients: {
	// 	type: [patientEmbeddedSchema],
	// 	required: true
	// }
});

const metricEmbeddedSchema = new mongoose.Schema({
	_id: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		auto: false,
		ref: 'Metric'
	},
	name: {
		type: String,
		required: true
	},
	description: {
		type: String
	},
	isRequired: {
		type: Boolean,
		required: true
	},
	dataType: {
		type: String,
		required: true
	}
});

const metricGroupEmbeddedSchema = new mongoose.Schema({
	_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'MetricGroup',
		auto: false,
		required: true,
	},
	name: {
		type: String,
		required: true
	},
	metrics: {
		type: [metricEmbeddedSchema],
		required: true
	},
	description: {
		type: String
	}
});

const sessionSchema = new mongoose.Schema({
	name: {
		type: String,
		default: 'untitled'
	},
	description: {
		type: String
	},
	startDate: {
		type: Date,
		required: true
	},
	endDate: {
		type: Date,
		required: true
	},
	locations: {
		type: [locationEmbeddedSchema],
		required: true
	},
	groups: {
		type: [metricGroupEmbeddedSchema],
		required: true
	},
	createdBy: {
		_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			auto: false
		},
		username: {
			type: String,
			required: true
		}
	},
	updatedBy: {
		_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			auto: false
		},
		username: {
			type: String,
			required: true
		}
	}
}, {
	timestamps: true
});

/* export model. */
module.exports = mongoose.model('Session', sessionSchema);
