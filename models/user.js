var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var shortid = require('shortid');

var userSchema = new Schema({
	userID: {type: String, 'default': shortid.generate},
	username: {type: String, required: true},
	email: {type: String, required: true},
	password: {type: String, required: false},
    budget: {type: Number, 'default': 200},
	age: {type: Number, required: false},
	sex: {type: String, required: false},
	description: {type: String, 'default': 'Write something about yourself'}
});

userSchema.methods.encryptPassword = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

userSchema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', userSchema);