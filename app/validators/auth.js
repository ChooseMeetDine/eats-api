var router = require('express').Router();
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var cert = process.env.JWTSECRET;

router.use(bodyParser.urlencoded({
  extended: true
}));

var auth = {};

auth.validate = function(req, res, next) {

  var token = req.headers['x-access-token'];

  if (token) {
    jwt.verify(token, cert, function(err, decoded) {
      if (err) {
        return res.json({
          message: 'Failed to authenticate token, please log in again'
        });
      } else {
        req.decoded = decoded;
        next();
      }
    });

  } else {
    return res.status(403).send({
      message: 'No token provided.'
    });
  }
};

module.exports = auth;
