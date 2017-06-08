var mongoose = require('mongoose');
var m = require('moment');
var Schema = mongoose.Schema;

var schema = new Schema({
	imagePath: String,
    owner : { type: Schema.Types.ObjectId, ref: 'User', required: true},
	title: {type: String, required: true},
	description: String,
	date: {type: Date, 'default': Date.now},
	price: {type: Number, required: true}
});

schema.virtual('descriptionBrief').get(function() {
    var desc = this.description;

    desc = desc.substr(0, 200);
    desc = desc.substr(0, desc.lastIndexOf(" ") || 200) + "...";

    return desc;
});

schema.virtual('dateFromNow').get(function() {
    return m(this.date).fromNow();
});

module.exports = mongoose.model('Product', schema);