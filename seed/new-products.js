var Product = require('../models/product');

var mongoose = require('mongoose');
mongoose.connect('localhost:27017/shopping');

var products = [
	new Product({
	imagePath: 'https://images-na.ssl-images-amazon.com/images/I/51z-LaPhT4L.jpg',
	title: 'Batman Arkham Asylum',
	description: '4th Best Game You\'ve Found!',
	price: 20
	}),
	new Product({
	imagePath: 'https://images-na.ssl-images-amazon.com/images/I/91NzZJVIXmL._SL1500_.jpg',
	title: 'Batman Arkham City',
	description: '2nd Best Game You\'ve Found!',
	price: 40
	}),
	new Product({
	imagePath: 'http://i.ebayimg.com/images/i/281210194287-0-1/s-l1000.jpg',
	title: 'Batman Arkham Origins',
	description: '3rd Best Game You\'ve Found!',
	price: 30
	}),
	new Product({
	imagePath: 'https://www.nosoloposters.com/6354/poster-batman-arkham-knight.jpg',
	title: 'Batman Arkham Knight',
	description: '1st Best Game You\'ve Found!',
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