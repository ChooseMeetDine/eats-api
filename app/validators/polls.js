var isvalid = require('isvalid');
var pg = require('../shared/database/knex');
var moment = require('moment');
var _ = require('underscore');

var pollValidator = {};

//exported middleware that validates a post body
pollValidator.post = function(req, res, next) {

  //Schema that defines the accepted variations of a post body
  var schema = {
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
      'allowNewRestaurants': {
        type: Boolean,
        required: false,
        default: true, //Defaults to true
        errors: {
          type: 'allowNewRestaurants must be a boolean'
        }
      },
      'restaurants': {
        type: Array,
        required: false, //not required
        custom: validateRestaurantIDs, //Validate all ID's in database
        default: [], //defaults to epmty array
        schema: { //Defines what the array contains
          type: String
        },
        errors: {
          type: 'restaurants must be an array of valid restaurant IDs as strings',
        }
      },
      'users': {
        type: Array,
        required: false, //not required
        custom: validateUserIDs, //Validate all ID's in database
        default: [], //defaults to epmty array
        schema: { //Defines what the array contains
          type: String
        },
        errors: {
          type: 'user must be an array of valid user IDs as strings',
        }
      },
      'group': {
        type: String,
        required: false,
        allowNull: true, //Allow null
        default: null,
        custom: validateGroupID, //Validate sent ID
        errors: {
          type: 'group must be a valid group ID as string',
        }
      },
      'expires': {
        type: String,
        required: false,
        custom: function(data) {
          if (!moment(data).isValid()) { //Validate timestamp with moment (ISO 8601)
            throw new Error('expires must be a ISO 8601 string');
          }
          //Also validate that expires is any time after now.
          var now = moment();
          var isLaterThenNow = moment(data).isAfter(now);
          if (isLaterThenNow) {
            return data;
          }
          throw new Error('expires must be a time later than now');
        },
        default: function() { //Default value is circa 20 minutes later than now
          var twentyMinutesLater = moment().add(20, 'm');
          return twentyMinutesLater;
        },
        errors: {
          type: 'expires must be a valid ISO 8601 date',
        }
      }
    }
  };

  //Use the schema to validate
  isvalid(req.body, schema, function(validationError, validData) {
    if (validationError) {
      next(validationError); //Handle errors in another middleware
    } else {
      req.validBody = validData;
      next();
    }
  });
};

// Uses the array of restaurant ID's from parameter "data" and selects
// the corresponding ID's from the database.
// Query will only return the ID's that actually exists, so we can match those with
// the ones in "data". Any difference between database result and "data" is
// ID's that does not exist, ie. invalid ID's
var validateRestaurantIDs = function(data, schema, done) {
  if (!data || data.length === 0) {
    return done(null, []);
  }
  pg.pluck('id') // Turns response from [{id:xxx}, {id:xxx}] to [xxx, xxx]
    .from('restaurant')
    .whereIn('id', data) //get all ID's from database that matches the data-array
    .then(function(res) {
      var diff = _.difference(data, res);
      if (diff.length > 1) {
        return done(new Error(diff + ' are not valid IDs'));
      } else if (diff.length === 1) {
        return done(new Error(diff + ' is not a valid ID'));
      }

      return done(null, data);

    }).catch(function(err) {
      console.log(err);
      done(new Error('Invalid restaurant IDs:' + data));
    });

};

var validateUserIDs = function(data, schema, done) {
  if (!data || data.length === 0) {
    return done(null, []);
  }
  pg.pluck('id') // Turns response from [{id:xxx}, {id:xxx}] to [xxx, xxx]
    .from('user')
    .whereIn('id', data) //get all ID's from database that matches the data-array
    .then(function(res) {
      var diff = _.difference(data, res);
      if (diff.length > 1) {
        return done(new Error(diff + ' are not valid IDs'));
      } else if (diff.length === 1) {
        return done(new Error(diff + ' is not a valid ID'));
      }

      return done(null, data);

    }).catch(function(err) {
      console.log(err);
      done(new Error('Invalid user IDs:' + data));
    });

};

// Check if the ID exists in database
var validateGroupID = function(data, schema, done) {
  //if data is null, dont contact database to validate it.
  if (!data) {
    return done(data, null);
  }
  pg.schema //Returns rows-object as either: [{exists:true}] or [{exists:false}]
    .raw('select exists(select 1 from "group" where id=' + data + ') AS "exists"')
    .then(function(res) {
      if (res.rows[0].exists) {
        return done(null, data);
      }
      return done(new Error(data + ' is not a valid group ID'));
    }).catch(function(err) {
      console.log(err);
      done(new Error('Invalid group ID:' + data));
    });
};

module.exports = pollValidator;
