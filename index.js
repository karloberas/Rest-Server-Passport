var http = require('http');
var debug = require('debug')('rest-server-passport')
var https = require('https');
var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');

var authenticate = require('./authenticate');
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

// Secure traffic only
app.all('*', function(req, res, next) {
    if (req.secure) {
        return next();
    }
    res.redirect('https://' + req.hostname + ':' + app.get('secPort') + req.url);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// passport config
app.use(passport.initialize());

app.get('/', function(req, res, next) {
    res.send("Hello world!");
});

var users = require('./routes/users');
app.use('/users', users);

app.use(function(err, req, res, next) {
    res.status(err.status || 500).json({
        message: err.message,
        error: err
    });
});

// app.listen(port, hostname, function() {
//     console.log(`Server running at http://${hostname}:${port}`);
// });

app.set('port', port);
app.set('secPort', port + 443);

var server = http.createServer(app);
server.listen(port, function() {
    console.log('Server listening on port ', port);
});
server.on('error', onError);
server.on('listening', onListening)

/**
 * Create HTTPS server
 */
var options = {
    key: fs.readFileSync(__dirname + '/private.key'),
    cert: fs.readFileSync(__dirname + '/certificate.pem')
};

var secureServer = https.createServer(options, app);
secureServer.listen(app.get('secPort'), function() {
    console.log('Server listening on port ', app.get('secPort'));
});
secureServer.on('error', onError);
server.on('listening', onListening)

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
    case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
    case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
    default:
        throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
    debug('Listening on ' + bind);
}