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
	description: {
		type: String
	},
	metrics: {
		type: [mongoose.Schema.Types.Mixed],
		required: true
	}
});

const sessionSchema = new mongoose.Schema({
	startDate: {
		type: Date,
		required: true
	},
	endDate: {
		type: Date,
		required: true
	},
	location: {
		type: [locationEmbeddedSchema],
		required: true
	},
	metricGroups: {
		type: [metricGroupEmbeddedSchema],
		required: true
	},
	isFinal: {
		type: Boolean,
		default: false
	}
}, { timestamps: true });

/* export model. */
module.exports = mongoose.model('Session', sessionSchema);
