/*
metric-group model.
*/

/** server config file. */
const config = require('../../server.json');

/** http://mongoosejs.com/
  mongoose provides a straight-forward, schema-based solution to model your application data.
  it includes built-in type casting, validation, query building, business logic hooks and more,
  out of the box.
*/
const mongoose = require('mongoose').set('debug', config.DEBUG_MONGOOSE);

const metricEmbeddedSchema = new mongoose.Schema({
	_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Metric',
		auto: false,
		required: true,
	},
	name: {
		type: String,
		required: true
	},
	isRequired: {
		type: Boolean,
		required: true
	},
	dataType: {
		type: String,
		required: true
	},
	description: {
		type: String
	},
});

/** main metric-group schema. */
const metricGroupSchema = new mongoose.Schema({
	// _id: Schema.Types.ObjectId,
	name: {
		type: String,
		required: true
	},
	description: {
		type: String
	},
	metrics: {
		type: [{
			type: metricEmbeddedSchema
		}]
	},
	updatedBy: {
		_id: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User'
		},
		username: {
			type: String,
			required: true
		}
	},
	createdBy: {
		_id: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User',
			set: function (id) {
				this._createdBy_id = this.createdBy._id;
				return id;
			}
		},
		username: {
			type: String,
			required: true,
			set: function (username) {
				this._createdByUsername = this.createdBy.username;
				return username;
			}
		},
	},
	editMode: {
		type: String,
		required: true,
		enum: ['free', 'restricted', 'blocked'],
		default: 'free'
	}
}, { timestamps: true });

metricGroupSchema.pre('save', function (next) {
	return next();
});

/* export model. */
module.exports = mongoose.model('MetricGroup', metricGroupSchema);
