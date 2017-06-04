var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressHbs = require('express-handlebars');
var mongoose = require('mongoose');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
var validator = require('express-validator');
var MongoStore = require('connect-mongo')(session);
var url = require('url');

var index = require('./routes/index');
var userRoutes = require('./routes/user');

var app = express();

mongoose.Promise = global.Promise;
mongoose.connect('localhost:27017/shopping');
require('./config/passport');

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', expressHbs({defaultLayout: 'layout', extname: '.hbs'}));
app.set('view engine', '.hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator());
app.use(cookieParser());
app.use(session({
  secret: 'arkhamtrilogy',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: mongoose.connection
  }),
  cookie: {
    maxAge: 180 * 60 * 1000 //180 minutes
  }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));


app.use(function(req, res, next) {
  res.locals.login = req.isAuthenticated();
  res.locals.session = req.session;

  next();
});


// app.get('/auth/google',
//     passport.authenticate('google', { scope: ['profile'] }));
//
// app.get('/auth/google/callback',
//     passport.authenticate('google', { failureRedirect: '/user/signin' }),
//     function(req, res) {
//         // Successful authentication, redirect home.
//         res.redirect('/');
// });
// app.post('/auth/google/callback', passport.authenticate('google'), function(req, res) {
//     // Return user back to client
//     res.send(req.user);
// });
//
// app.use('/auth/google/callback', function(req, res, next) {
//     // var google = require('googleapis');
//     // var plus = google.plus('v1');
//     //
//     // var API_KEY = 'ABC123'; // specify your API key here
//     //
//     // plus.people.get({
//     //     auth: API_KEY,
//     //     userId: 'me'
//     // }, function (err, user) {
//     //     console.log('Result: ' + (err ? err.message : user.displayName));
//     // });
//     //-----------------------------------------------------
//     var google = require('googleapis');
//     var OAuth2 = google.auth.OAuth2;
//
//     var oauth2Client = new OAuth2(
//         '855842568245-o6avt6qd8psun8go0eauherhk9uhk53l.apps.googleusercontent.com',
//         'IPRMrsrtVHGF9yYS7hqP9IZu',
//         'http://localhost:3000'
//     );
//
// // generate a url that asks permissions for Google+ and Google Calendar scopes
//     var scopes = [
//         'https://www.googleapis.com/auth/plus.me',
//         'https://www.googleapis.com/auth/calendar'
//     ];
//
//     var url = oauth2Client.generateAuthUrl({
//         // 'online' (default) or 'offline' (gets refresh_token)
//         access_type: 'offline',
//
//         // If you only need one scope you can pass it as a string
//         scope: scopes
//
//         // Optional property that passes state parameters to redirect URI
//         // state: { foo: 'bar' }
//     });
//     //http://localhost:3000/?code=4/6nNjZk15ekX5lZXtDOuSsKkahIzTBWTjcn0c9EAJki4#
//     console.log("URL : " + url);
//     res.redirect(url);
//
//
//     //---------------------------------
// //     var google = require('googleapis');
// //     var plus = google.plus('v1');
// //     var OAuth2 = google.auth.OAuth2;
// //     var oauth2Client = new OAuth2(
// //         '855842568245-o6avt6qd8psun8go0eauherhk9uhk53l.apps.googleusercontent.com',
// //         'IPRMrsrtVHGF9yYS7hqP9IZu',
// //         'http://localhost:3000'
// //     );
// //
// // // Retrieve tokens via token exchange explained above or set them:
// //     oauth2Client.setCredentials({
// //         access_token: 'ACCESS TOKEN HERE',
// //         refresh_token: 'REFRESH TOKEN HERE'
// //         // Optional, provide an expiry_date (milliseconds since the Unix Epoch)
// //         // expiry_date: (new Date()).getTime() + (1000 * 60 * 60 * 24 * 7)
// //     });
// //
// //     plus.people.get({
// //         userId: 'me',
// //         auth: oauth2Client
// //     }, function (err, response) {
// //         // handle err and response
// //     });
// });

app.use('/user', userRoutes);
app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
