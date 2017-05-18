var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
	imagePath: String,
	owner: {type: String, required: true},
	title: {type: String, required: true},
	brief_description: String,
	description: String,
	date: String,
	price: {type: Number, required: true}
});

module.exports = mongoose.model('Product', schema);