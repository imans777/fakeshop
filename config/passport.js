var passport = require('passport');
var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;



var GooglePlusStrategy = require('passport-google-plus');
passport.use(new GooglePlusStrategy({
        clientId: '855842568245-o6avt6qd8psun8go0eauherhk9uhk53l.apps.googleusercontent.com',
        clientSecret: 'IPRMrsrtVHGF9yYS7hqP9IZu'
    },
    function(tokens, profile, done) {
        // Create or update user, call done() when complete...
        done(null, profile, tokens);
    }
));



var GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
        clientID: '855842568245-o6avt6qd8psun8go0eauherhk9uhk53l.apps.googleusercontent.com',
        clientSecret: 'IPRMrsrtVHGF9yYS7hqP9IZu',
        callbackURL: "/auth/google/callback"
    },
    function(accessToken, refreshToken, profile, cb) {
        User.findOrCreate({ googleId: profile.id }, function (err, user) {
            return cb(err, user);
        });
    }
));



passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	User.findById(id, function(err, user) {
		done(err, user);
	});
});

passport.use('local.signup', new LocalStrategy({
	usernameField: 'email',
	passwordField: 'password',
	passReqToCallback: true
}, function(req, email, password, done) {
    req.checkBody('username', 'Invalid Username').notEmpty().isLength({min: 3, max: 15});
	req.checkBody('email', 'Invalid Email').notEmpty().isEmail();
	req.checkBody('password', 'Invalid Password').notEmpty().isLength({min: 4});
	var errors = req.validationErrors();
	if (errors) {
		var messages = [];
		errors.forEach(function(error) {
			messages.push(error.msg);
		});
		return done(null, false, req.flash('error', messages));
	}

	User.findOne({'email': email}, function(err, user) { //should be unique email
		if (err) {
			return done(err);
		}
		if (user) {
			return done(null, false, {message: 'This Email Has Already Been Used Before.'});
		}

		User.findOne({'username': req.body.username}, function(err, user) { //and unique username
            if (err) {
                return done(err);
            }
            if (user) {
                return done(null, false, {message: 'Username Already Exists.'});
            }
            var newUser = new User();
            newUser.username = req.body.username;
            newUser.email = email;
            newUser.password = newUser.encryptPassword(password);
            newUser.save(function(err, res) {
                if (err) {
                    return done(err);
                }
                return done(null, newUser);
            });

		});
	});
}));

passport.use('local.signin', new LocalStrategy({
	usernameField: 'email',
	passwordField: 'password',
	passReqToCallback: true
}, function(req, email, password, done) {
	req.checkBody('email', 'Invalid Email').notEmpty().isEmail();
	req.checkBody('password', 'Invalid password').notEmpty();
	var errors = req.validationErrors();
	if (errors) {
		var messages = [];
		errors.forEach(function(error) {
			messages.push(error.msg);
		});
		return done(null, false, req.flash('error', messages));
	}
	User.findOne({'email': email}, function(err, user) {
		if (err) {
			return done(err);
		}
		if (!user) {
			return done(null, false, {message: 'User Not Found.'});
		}
		if (!user.validPassword(password)) {
			return done(null, false, {message: 'Wrong Password.'});
		}
		return done(null, user);
	});
}));