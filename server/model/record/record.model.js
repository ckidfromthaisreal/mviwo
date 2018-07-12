/*
record model.
*/

/** server config file. */
const config = require('../../server.json');

/** http://mongoosejs.com/
  mongoose provides a straight-forward, schema-based solution to model your application data.
  it includes built-in type casting, validation, query building, business logic hooks and more,
  out of the box.
*/
const mongoose = require('mongoose').set('debug', config.DEBUG_MONGOOSE);

const resultSchema = new mongoose.Schema({
	_id: {
		auto: false
	},
	group: {
		_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'MetricGroup',
			required: true,
			auto: false
		},
		name: {
			type: String,
			required: true
		}
	},
	metric: {
		_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Metric',
			required: true,
			auto: false
		},
		name: {
			type: String,
			required: true
		}
	},
	value: {
		type: mongoose.Schema.Types.Mixed
	}
});

const patientEmbeddedSchema = new mongoose.Schema({
	_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Patient',
		auto: false
	},
	uid: {
		type: String,
		required: true
	}
});

const recordSchema = new mongoose.Schema({
	session: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Session',
		required: true
	},
	patient: {
		type: patientEmbeddedSchema,
		required: true
	},
	results: {
		type: [resultSchema],
		required: true
	}
	, createdBy: {
		_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true
		},
		username: {
			type: String,
			required: true
		}
	}
	, updatedBy: {
		_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true
		},
		username: {
			type: String,
			required: true
		}
	}
}, { timestamps: true });

/* export model. */
module.exports = mongoose.model('Record', recordSchema);
