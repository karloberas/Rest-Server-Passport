var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var config = require('./config');

mongoose.connect(config.mongoUrl, { useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection errpr:'));
db.once('open', function() {
    console.log("Connected to MongoDB server");
});

var hostname = 'localhost';
var port = 3000;

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// passport config
var User = require('./models/user');
app.use(passport.initialize());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

var users = require('./routes/users');
app.use('/users', users);

app.use(function(err, req, res, next) {
    res.status(err.status || 500).json({
        message: err.message,
        error: err
    });
});

app.listen(port, hostname, function() {
    console.log(`Server running at http://${hostname}:${port}`);
});