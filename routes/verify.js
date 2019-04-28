var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var User = require('../models/user');
var config = require('../config');

exports.getToken = function(user) {
    return jwt.sign(user.toJSON(), config.secretKey, { expiresIn: 3600 });
};

exports.verifyOrdinaryUser = function(req, res, next) {
    // check header, url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    //decode token
    if (token) {
        // verifies secret and checks expiration
        jwt.verify(token, config.secretKey, function(err, decoded) {
            if (err) {
                var err = new Error('You are not authenticated!');
                err.status = 401;
                return next(err);
            }
            else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });
    }
    else {
        // if there is no token
        // return an error
        var err = new Error('No token provided!');
        err.status = 403;
        return next(err);
    }
}

exports.verifyAdminUser = function(req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    if (token) {
        jwt.verify(token, config.secretKey, function(err, decoded) {
            if (err) {
                var err = new Error('You are not authenticated!');
                err.status = 401;
                return next(err);
            }
            else {
                if (!decoded.admin) {
                    var err = new Error('You are not authorized to perform this operation!');
                    err.status = 403;
                    return next(err);
                }
                else {
                    req.decoded = decoded;
                    next();
                }
            }
        });
    }
    else {
        var err = new Error('No token provided!');
        err.status = 403;
        return next(err);
    }
}