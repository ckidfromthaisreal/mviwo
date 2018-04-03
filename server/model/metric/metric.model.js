/* http://mongoosejs.com/
  mongoose provides a straight-forward, schema-based solution to model your application data.
  it includes built-in type casting, validation, query building, business logic hooks and more,
  out of the box.
*/
const mongoose = require('mongoose');

const numberParamsSchema = new mongoose.Schema({
    _id: {auto: false},
    minValue: {type: Number},
    maxValue: {type: Number},
    step: {type: Number},
    tickInterval: {type: Number},
    prefix: {type: String},
    postfix: {type: String}
});

const stringParamsSchema = new mongoose.Schema({
    _id: {auto: false},
    isEmail: {type: Boolean, required: true},
    lineBreaks: {type: Boolean},
    minLength: {type: Number},
    maxLength: {type: Number},
    pattern: {type: String},
    hint: {type: String}
});

const enumParamsSchema = new mongoose.Schema({
    _id: {auto: false},
    isMultiple: {type: Boolean, required: true},
    values: {type: [String], required: true}
});

const blobParamsSchema = new mongoose.Schema({
    _id: {auto: false},
    maxSize: {type: Number},
    extensions: [String]
});

const dateParamsSchema = new mongoose.Schema({
    _id: {auto: false},
    format: {type: String, default: 'yyyy-dd-mm'},
    minDate: {type: Date},
    maxDate: {type: Date}
});

const metricSchema = new mongoose.Schema({
    // _id: {type: Schema.Types.ObjectId},
    name: {type: String, required: true, index: true},
    description: {type: String},
    isRequired: {type: Boolean, required: true},
    dataType: {type: String, required: true, 
            enum: ['string', 'number', 'enum', 'boolean', 'blob', 'date']},
    groups: {
        type: [{type: mongoose.Schema.Types.ObjectId,
                ref: 'MetricGroup'}]
    },
    numberParams: {type: numberParamsSchema},
    stringParams: {type: stringParamsSchema},
    enumParams: {type: enumParamsSchema},
    blobParams: {type: blobParamsSchema},
    dateParams: {type: dateParamsSchema},
    lastUpdate: {type: Date, default: Date.now}
});

/* virtual for metric's URL */
metricSchema.virtual('url').get(() => {
    return '/metrics/' + this._id;
});

/* export model. */
module.exports = mongoose.model('Metric', metricSchema);