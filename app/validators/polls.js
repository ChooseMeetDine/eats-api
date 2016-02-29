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

var validateGroupID = function(data, schema, done) {
  //if data is null, dont contact database to validate it.
  if (!data) {
    return done(null, null);
  }
  pg.schema
    .raw('select exists(select 1 from "group" where id=' + data + ') AS "exists"')
    .then(function(res) {
      if (res.rows[0].exists) {
        return done(null, data);
      }
      return done(new Error(data + ' is not a valid group ID'));
    });
};

var isInteger = function(data) {
  return (typeof data === 'number' && (data % 1) === 0);
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
      'allowNewRestaurants': {
        type: Boolean,
        required: false,
        default: true,
        errors: {
          type: 'allowNewRestaurants must be a boolean'
        }
      },
      'restaurants': {
        type: Array,
        required: false,
        custom: validateRestaurantIDs,
        default: [],
        schema: {
          type: Number,
          custom: function(data) {
            if (data && !isInteger(data)) {
              throw new Error('restaurants must be an array of integers');
            }
            return data;
          },
          errors: {
            type: 'restaurant ids must be integers',
          }
        },
        errors: {
          type: 'restaurants must be an array of restaurant IDs',
        }
      },
      'group': {
        type: Number,
        required: false,
        allowNull: true,
        custom: [
          validateGroupID,
          function(data) {
            if (data && !isInteger(data)) {
              throw new Error('group ID must be an integer');
            }
            return data;
          }
        ],
        default: null,
        errors: {
          type: 'group must be a valid group ID',
        }
      },
      'expires': {
        type: String,
        required: false,
        match: /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/,
        default: null,
        errors: {
          type: 'expires must be a valid ISO 8601 date',
          match: 'expires must be a valid ISO 8601 date',
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
