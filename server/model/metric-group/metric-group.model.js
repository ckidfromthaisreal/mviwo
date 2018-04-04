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

/** main metric-group schema. */
const metricGroupSchema = new mongoose.Schema({
    // _id: Schema.Types.ObjectId,
    name: {type: String, required: true, unique: true},
    description: {type: String},
    isMandatory: {type: Boolean, required: true},
    metrics: [{type: mongoose.Schema.Types.ObjectId, ref: 'Metric'}],
    lastUpdate: {type: Date, default: Date.now}
});

/* virtual for metric's URL */
// metricGroupSchema.virtual('url').get(() => {
//     return `/metric-groups/${this._id}`;
// });

/* export model. */
module.exports = mongoose.model('MetricGroup', metricGroupSchema);