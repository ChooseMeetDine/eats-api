var isvalid = require('isvalid');
var pg = require('../shared/knex');

var pollValidator = {};


// Uses the array of restaurant ID's from parameter "data" and selects
// the corresponding ID's from the database.
// Query will only return the ID's that actually exists, so we can match those with
// the ones in "data". Any difference between database result and "data" is
// ID's that does not exist, ie. invalid ID's
var validateRestaurantIDs = function(data, schema, done) {

  pg.pluck('id')
    .from('restaurant')
    .whereIn('id', data)
    .then(function(res) {

      //I want to use this. But postgres returns id's as strings, not numbers..
      //var diff = underscore.difference(data, res);
      var diff = [];
      var len = data.length;
      for (var i = 0; i < len; i++) {
        if (res.indexOf('' + data[i]) === -1) {
          diff.push(data[i]);
        }
      }
      if (diff.length > 1) {
        return done(new Error(diff + ' are not valid IDs'));
      } else if (diff.length === 1) {
        return done(new Error(diff + ' is not a valid ID'));
      }

      return done(null, data);
    }).catch(function(err) {
      console.log('err');
      console.log(err);
      done(new Error('Invalid restaurant IDs'));
    });

};

pollValidator.post = function(req, res, next) {
  var schema = {
    type: Object,
    unknownKeys: 'deny',
    required: 'implicit',
    schema: {
      'name': {
        type: String,
        required: true,
        errors: {
          type: 'name must be a String',
          required: 'name is required.'
        }
      },
      'fixedVote': {
        type: Boolean,
        required: false,
        default: false,
        errors: {
          type: 'fixed_vote must be a boolean'
        }
      },
      'restaurants': {
        type: Array,
        required: false,
        custom: validateRestaurantIDs,
        default: [],
        schema: {
          type: Number,
          errors: {
            type: 'restaurant ids must be integers',
          }
        },
        errors: {
          type: 'restaurants must be an array of restaurant IDs',
        }
      }
    }
  };

  isvalid(req.body, schema, function(validationError, validData) {
    if (validationError) {
      //Hantera fel på ett bättre sätt
      console.log(validationError);
      res.status(400).json(validationError);
    } else {
      console.log(validData);
      req.valid = validData;
      next();
    }
  });
};


module.exports = pollValidator;
