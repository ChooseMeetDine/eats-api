var jwt = require('jsonwebtoken');
var cert = process.env.JWTSECRET;
var isvalid = require('isvalid');
var auth = {};
var errorUtils = require('../shared/error_utils');

auth.validate = function(req, res, next) {

  var token = req.headers['x-access-token'];

  if (token) {
    jwt.verify(token, cert, function(err, decoded) {
      if (err) {
        return res.status(403).json({
          message: 'Failed to authenticate token, please log in again'
        });
      } else {
        req.validUser = decoded;
        next();
      }
    });

  } else {
    return res.status(403).send({
      message: 'No token provided.'
    });
  }
};

auth.checkData = function(req, res, next) {

  var authSchema = {
    type: Object,
    unknownKeys: 'deny', //Send error for parameters that does not exist in this schema
    required: 'implicit', //Parent of required parameter becomes required.
    schema: {
      'email': {
        type: String, //Has to be a string
        required: true, //is required
        errors: {
          type: 'email must be a String', //error if type: String throws error
          required: 'email is required.' //error if name is not present
        }
      },
      'password': {
        type: String, //Has to be a string
        required: true, //is required
        errors: {
          type: 'password must be a String', //error if type: String throws error
          required: 'password is required.' //error if name is not present
        }
      }
    },
    errors: {
      type: 'expires must be valid input',
    }
  };

  var request = req.body;

  isvalid(request, authSchema, function(validationError, validData) {
    if (validationError) {
      validationError.status = 400;
      errorUtils.checkForUnkownKeyError(validationError);
      next(validationError); //Handle errors in another middleware
    } else {
      req.validBody = validData;
      next();
    }
  });

};

module.exports = auth;
