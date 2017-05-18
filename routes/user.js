var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');

var Cart = require('../models/cart');
var Order = require('../models/order');
var User = require('../models/user');

var gravatar = require('gravatar');

var csrfProtection = csrf();

router.post('/setting', isLoggedIn, function(req, res, next) {
    User.findOneAndUpdate({
        'email': req.session.user.email
    }, {
        'age': req.body.age,
        'description': req.body.description,
        'sex': req.body.sex
    }, function(err, user) {
        req.session.user.age = req.body.age;
        req.session.user.description = req.body.description;
        req.session.user.sex = req.body.sex;
        if(err) {
            req.flash('error', 'There was a problem changing information');
            req.redirect('/user/setting');
        }
        req.flash('success', 'Settings Successfully Changed!');
        res.redirect('/user/setting');
    });
});

router.use(csrfProtection);

router.get('/account', isLoggedIn, function(req, res, next) {
    Order.find({user: req.user}, function(err, orders) {
        if(err) {
            return res.write('This Error Shouldn\'t Have Happened :|');
        }
        var cart;
        orders.forEach(function(order) {
           cart = new Cart(order.cart);
           order.items = cart.generateArray();
        });
        res.render('user/account', {
            orders: orders
        });
    });
});

router.get('/setting', isLoggedIn, function(req, res, next) {
    var userData = req.session.user;
    var errMsg = req.flash('error')[0];
    var isErr = true;
    var hasSth;
    if(errMsg) {
        hasSth = true;
    }
    if(!errMsg) {
        errMsg =  req.flash('success')[0];
        if(errMsg) {
            hasSth = true;
        }
        else {
            hasSth = false;
        }
        isErr = false;
    }
    var isMan, isWoman;
    if(req.session.user.sex) {
        if(req.session.user.sex == "male")
            isMan = true;
        else
            isMan = false;
        isWoman = !isMan;
    }
    else
        isWoman = false;

    //set the gravatar, by the way
    var image = gravatar.url(userData.email);
    userData.image = image;

    res.render('user/setting', {
        user: userData,
        errMsgSetting: errMsg,
        hasErrorSetting: isErr,
        hasSomething: !hasSth,
        isMan: isMan,
        isWoman: isWoman
    });
});

router.get('/logout', isLoggedIn, function(req, res, next) {
    req.logout();
    res.redirect('/');
});

router.use('/', notLoggedIn, function(req, res, next) {
    next();
});

router.get('/signup', function(req, res, next) {
    var messages = req.flash('error');
    res.render('user/signup', { csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 });
});

router.post('/signup', passport.authenticate('local.signup', {
    failureRedirect: '/user/signup',
    failureFlash: true
}), function(req, res, next) {
    if(req.session.oldUrl) {
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        User.findOne({'username': req.body.username}, function(err, user) {
            if(err) {
                return res.write('Unexpected Error!');
            }
            req.session.user = user;
            req.app.locals.username = user.username;
            res.redirect(oldUrl);
        });
    } else {
        User.findOne({'username': req.body.username}, function(err, user) {
            if(err) {
                return res.write('Unexpected Error!');
            }
            req.session.user = user;
            req.app.locals.username = user.username;
            res.redirect('/user/account');
        });
    }
});

router.get('/signin', function(req, res, next) {
    var messages = req.flash('error');
    res.render('user/signin', { csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 });
});

router.post('/signin', passport.authenticate('local.signin', {
    failureRedirect: '/user/signin',
    failureFlash: true
}), function(req, res, next) {
    if(req.session.oldUrl) {
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        User.findOne({'email': req.body.email}, function(err, user) {
            if(err) {
                return res.write('Unexpected Error.');
            }
            if(!user) {
                return res.write('User Not Found!');
            }
            req.session.user = user;
            req.app.locals.username = user.username;
            res.redirect(oldUrl);
        });
    } else {
        User.findOne({'email': req.body.email}, function(err, user) {
            if(err) {
                return res.write('Unexpected Error.');
            }
            if(!user) {
                return res.write('User Not Found!');
            }
            req.session.user = user;
            req.app.locals.username = user.username;
            res.redirect('/user/account');
        });
    }
});

module.exports = router;

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

function notLoggedIn(req, res, next) {
    if(!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}