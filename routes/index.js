var express = require('express');
var router = express.Router();

var url = require('url');
var qs = require('query-string');

var Cart = require('../models/cart');
var User = require('../models/user');
var Product = require('../models/product');
var Order = require('../models/order');

/*
 ------------------ DONE ------------->
 --TODO: /product/:id 	-> individual product page for more information and ...
 --TODO: /?title="b"		-> be a filter-like for products / if products e.g more than 20, have next pages for it / search button
 --TODO: /user/signin		-> login via username too / login via google too
 --TODO: /user/pro/username-> show the 'username's profile (username/email/gravatar!/number of posts/number of bills/number of being likeds/last comment!)
 --TODO: brief description has been optimized

 ------------------ WORKING ON THEM -->

 ------------------ WILL BE DONE ----->
 -TODO: /user/bills	 	-> all the bought products, or better to say bills


 TODO: /user/products 	-> all the created products are here
 TODO: make the done bills's link available so that we can click on it and redirect to the product
 TODO: delete/update products
 TODO: current money on your account / 200$ by default in it
 TODO: expand the search by costs, person, dates, etc.
 ----------------- WHEN DONE ---------->
 TODO: page bandi
 TODO: inspire from the "Node MongoDB" book and build up the system of: uploading/liking/commenting/number of boughts | sidebar
 TODO: admin/admin@admin.admin/admin has the authority to manage things :D
 --------------------- THIS WILL BE YOUR VERY EXCELLENT PORTFOLIO :D ---------------------
*/


// var google = require('googleapis');
// var OAuth2 = google.auth.OAuth2;
//
// var oauth2Client = new OAuth2(
//     '855842568245-o6avt6qd8psun8go0eauherhk9uhk53l.apps.googleusercontent.com',
//     'IPRMrsrtVHGF9yYS7hqP9IZu',
//     'http://localhost:3000'
// );

// generate a url that asks permissions for Google+ and Google Calendar scopes
// var scopes = [
//     'https://www.googleapis.com/auth/plus.me',
//     'https://www.googleapis.com/auth/calendar'
// ];
//
// module.exports = {
//     google: google,
//     OAuth2: OAuth2,
//     oauth2Client: oauth2Client,
//     scopes: scopes
// }

/* GET home page. */
router.get('/', function(req, res, next) {

	// if(req.query.code)
	// {
     //    oauth2Client.getToken(req.query.code, function (err, tokens) {
     //        // Now tokens contains an access_token and an optional refresh_token. Save them.
     //        if (!err) {
     //            oauth2Client.setCredentials(tokens);
     //            console.log("SUCCESSFULLY! " + tokens);
     //        }
     //    });
	// }

    // var searchedTitle = decodeURI(url.parse(req.url).query);
    // var questionTitle = searchedTitle.substr(0, searchedTitle.indexOf('='));
	// console.log("SEARCHED: " + req.query.search); //NOTE THIS!
	var sendObj = {
        title: 'Shop',
        products: [],
        successMsg: '',
        noMessage: false,
        isErr: true
	};
	// searchedTitle = searchedTitle.substr(searchedTitle.indexOf('=') + 1, searchedTitle.length - searchedTitle.indexOf('='));
	// searchedTitle = searchedTitle.replace('+', ' ');
	// console.log(searchedTitle);
	// console.log(searchedTitle.length);
	if (!req.query.search) {
		Product.find(function handleDB(err, docs) {
			sendObj.successMsg = req.flash('success')[0];
            sendObj.noMessage = !sendObj.successMsg;
            sendObj.isErr = false;
			if(err) {
                sendObj.title = 'Error';
                sendObj.successMsg = 'Error Occurred While Accessing Database.';
                res.render('shop/index', sendObj);
                return;
			}
			sendObj.products = getProducts(docs);
			res.render('shop/index', sendObj);
		});
	}else {
        // if(questionTitle != 'search') {
        //     sendObj.title = 'Error';
        //     sendObj.successMsg = 'Title Unexpected!';
        //     res.render('shop/index', sendObj);
        //     return;
        // }
        var searchedTitle = req.query.search;
		Product.find({'title': {$regex: searchedTitle, $options: 'i'}}).exec(function handleDB(err, docs) {
			sendObj.isErr = false;
			var sentence;
			if (docs.length == 0) {
				sentence = 'No Item Found!';
				sendObj.isErr = true;
			}
			else if (docs.length == 1)
				sentence = '1 Item Found!';
			else
				sentence = docs.length + ' Items Found!';
			req.flash('success', sentence);
            sendObj.successMsg = req.flash('success')[0];
            sendObj.noMessage = !sendObj.successMsg;
			if (err) {
				sendObj.title = 'Error';
				sendObj.successMsg = 'Error Occurred While Accessing Database.';
				res.render('shop/index', sendObj);
				return;
			}
			sendObj.products = getProducts(docs);
			res.render('shop/index', sendObj);
		});
	}

});

router.get('/product/:id', function(req, res, next) {
	Product.findById(req.params.id, function(err, product) {
		if(err || !product) {
			res.render('shop/product', {
				message: "Product Not Found!",
				hasProblem: true
			});
		}
		else {
            User.findById(product.owner, function(err, user) {
                if(err) {
                    throw err;
                }
                product.owner = user;
                res.render('shop/product', {
                    product: product,
                    hasProblem: false
                });
            });

        }
	});
});

router.get('/add-to-cart/:id', function(req, res, next) {
	var productId = req.params.id;
	var cart = new Cart(req.session.cart? req.session.cart: {});

	Product.findById(productId, function(err, product) {
		if(err) {
			return res.redirect('/');
		}
		cart.add(product, product.id);
		req.session.cart = cart;
		console.log(req.session.cart);
		res.redirect('/');
	});
});

router.get('/reduce/:id', function(req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart? req.session.cart: {});

    cart.reduceByOne(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});

router.get('/remove/:id', function(req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart? req.session.cart: {});

    cart.removeItem(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});

router.get('/shopping-cart', function(req, res, next) {
	if(!req.session.cart) {
		return res.render('shop/shopping-cart', {products: null});
	}
	var cart = new Cart(req.session.cart);
	res.render('shop/shopping-cart', {products: cart.generateArray(), totalPrice: cart.totalPrice});
});

router.get('/checkout', isLoggedIn, function(req, res, next) {
    if(!req.session.cart) {
        return res.redirect('./shopping-cart');
    }
    var cart = new Cart(req.session.cart);
    var errMsg = req.flash('error')[0];
    res.render('shop/checkout', {
    	total: cart.totalPrice,
		errMsg: errMsg,
		noError: !errMsg
	});
});

router.post('/checkout', isLoggedIn, function (req, res, next) {
    if(!req.session.cart) {
        return res.redirect('./shopping-cart');
    }
    var cart = new Cart(req.session.cart);

    // var stripe = require("stripe")(
    //     "sk_test_n3yFkI8wO1bOlrzY9lKCYXi2"
    // );

    // stripe.charges.create({
    //     amount: cart.totalPrice * 100,
    //     currency: "usd",
    //     source: req.body.stripeToken, // obtained with Stripe.js
    //     description: "Test Charge For Buying My Products"
    // }, function(err, charge) {
    //     // asynchronously called
		// if(err) {
		// 	req.flash('error', err.message);
		// 	return res.redirect('/checkout');
		// }
		var order = new Order({
			user: req.user,
			cart: cart,
			address: req.body.address,
			name: req.body.name,
			//paymentId: 8972380234909
		});
		order.save(function(err, result) {
			if(err) {
				//
			}
            req.flash('success', 'Product Bought Successfully!');
            req.session.cart = null;
            res.redirect('/');
		});

    // });
});

router.get('/add-product', isLoggedIn, function(req, res, next) {
	var scsMsg = req.flash('success-addition')[0];
	var hasSth;
	if(scsMsg) {
		hasSth = true;
	}
	else {
		hasSth = false;
	}
	res.render('shop/add-product', {
        hasError: false,
        hasSomething: !hasSth,
        errMsgSetting: scsMsg
	});
});

router.post('/add-product', isLoggedIn, function(req, res, next) {
	// var c_date = new Date();
    // console.log(req.session.user);
	var product = new Product({
        imagePath: req.body.imageurl,
        owner: req.session.user,
		title: req.body.title,
        // brief_description: req.body.description.substr(0,200),
		description: req.body.description,
		// date: c_date.getUTCFullYear() + "/" + c_date.getMonth() + "/" + c_date.getDay() + " " + c_date.getUTCHours() + ":" + c_date.getMinutes(),
		price: req.body.price
	});
    console.log(product.owner);
	product.save(function(err, prdct) {
		if(err) {
			throw err;
		}
		req.flash('success-addition', 'Product Successfully Added!');
		res.redirect('add-product');
	});
});

module.exports = router;

function getProducts(docs) {
    docs.forEach(function(doc, i) {
        User.findById(doc.owner, function(err, user) {
            if(err) {
                return;
            }
            docs[i].owner = user;
        });
    });
    var productChunks = [];
    var chunckSize = 3;
    for (var i = 0; i < docs.length; i += chunckSize) {
        productChunks.push(docs.slice(i, i + chunckSize));
    }
    return productChunks;
}

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.session.oldUrl = req.url;
    res.redirect('/user/signin');
}