var Product = require('../models/product');

var mongoose = require('mongoose');
mongoose.connect('localhost:27017/shopping');

var products = [
	new Product({
	imagePath: 'http://i.imgur.com/xyYgP5t.jpg',
	title: 'Batman Arkham Asylum',
	description: 'Forth Best Game You\'ve Found!',
	price: 20
	}),
	new Product({
	imagePath: 'http://i.imgur.com/xyYgP5t.jpg',
	title: 'Batman Arkham City',
	description: 'Second Best Game You\'ve Found!',
	price: 40
	}),
	new Product({
	imagePath: 'http://i.imgur.com/xyYgP5t.jpg',
	title: 'Batman Arkham Origins',
	description: 'Third Best Game You\'ve Found!',
	price: 30
	}),
	new Product({
	imagePath: 'http://i.imgur.com/xyYgP5t.jpg',
	title: 'Batman Arkham Knight',
	description: 'First Best Game You\'ve Found!',
	price: 60
	})
];

var done = 0;
for (var i = 0; i < products.length; i++) {
	products[i].save(function(err, res) {
		done++;
		if(done == products.length) {
			exit();
		}
	});
}

function exit()
{
	mongoose.disconnect();
}