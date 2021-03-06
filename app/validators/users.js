var isvalid = require('isvalid');
var pg = require('../shared/database/knex');
var userValidator = {};
var errorUtils = require('../shared/error_utils');

// Exported middleware that validates a POST body to /users
userValidator.post = function(req, res, next) {
  //Use the schema to validate
  isvalid(req.body, getUserPostSchema(), function(validationError, validData) {
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

// Exported middleware that validates a user ID from /users/:id
userValidator.getId = function(req, res, next) {
  //No schema needed to validate a single parameter
  validateUserID(req.params.id)
    .then(function(id) {
      req.validParams = {
        id: id
      };
      next();
    })
    .catch(function(error) {
      error.message = 'User ID: ' + req.params.id + ' does not exist.';
      error.status = 404;
      next(error);
    });
};

// Exported middleware that checks if the requesting user is requesting data from him/her self
userValidator.checkIfRequestingSelf = function(req, res, next) {
  if (req.validParams.id.toString() === req.validUser.id.toString()) {
    req.validUser.isRequestingSelf = true;
  } else {
    req.validUser.isRequestingSelf = false;
  }
  next();
};


// Check if the ID exists in database
var validateUserID = function(userId) {
  return pg.schema
    .raw('select exists(select 1 from "user" where id=' + userId + ') AS "exists"')
    .then(function(res) {
      if (res.rows[0].exists) {
        return userId;
      }
      return Promise.reject();
    }).catch(function(err) {
      console.log(err);
      return Promise.reject(new Error(userId + ' does not exist as a user ID'));
    });
};


//Schema that defines the accepted variations of a post body
var getUserPostSchema = function() {
  return {
    type: Object,
    unknownKeys: 'deny', //Send error for parameters that does not exist in this schema
    required: 'implicit', //Parent of required parameter becomes required.
    schema: {
      'name': {
        type: String, //Has to be a string
        required: true, //is required
        errors: {
          type: 'name must be a String', //error if type: String throws error
          required: 'name is required.' //error if name is not present
        }
      },
      'password': {
        type: String, //Has to be a string
        required: true, //is required
        errors: {
          type: 'password must be a String',
          required: 'password is required.'
        }
      },
      'email': {
        type: String, //Has to be a string
        required: true, //is required
        custom: validateIfEmailIsUnique,
        errors: {
          type: 'email must be an email address as a String',
          required: 'email is required.'
        }
      },
      'photo': {
        type: String, //Has to be a string
        default: null,
        errors: {
          type: 'photo must be an url formatted as a String',
          required: 'photo is required.'
        }
      },
      'phone': {
        type: String, //Has to be a string
        default: null,
        custom: function validatePhoneSize(data) {
          if (!data) {
            return data;
          }
          if (data.length > 30) {
            throw new Error('Phone number is too long. Please provide a proper number.');
          }
          return data;
        },
        errors: {
          type: 'phone must be phone number formatted as a String',
          required: 'phone is required.'
        }
      }
    }
  };
};

// Checks database if email is already in use or not
var validateIfEmailIsUnique = function(data, schema, done) {
  if (!data) {
    return done(null, data);
  }
  pg.schema //Returns rows-object as either: [{exists:true}] or [{exists:false}]
    .raw('select exists(select 1 from "user" where email=\'' + data + '\') AS "exists"')
    .then(function(res) {
      if (res.rows[0].exists) {
        return done(new Error(data + ' is already registered as a user'));
      }
      return done(null, data);
    }).catch(function(err) {
      console.log(err);
      return done(new Error('Error validating email address:' + data));
    });
};

module.exports = userValidator;
