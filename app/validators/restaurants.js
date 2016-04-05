var isvalid = require('isvalid');
var pg = require('../shared/database/knex');
var _ = require('underscore');

var restaurantValidator = {};

//exported middleware that validates a post body
restaurantValidator.post = function(req, res, next) {
  //Use the schema to validate
  isvalid(req.body, getRestaurantPostSchema(), function(validationError, validData) {
    if (validationError) {
      validationError.status = 400;
      next(validationError); //Handle errors in another middleware
    } else {
      req.validBody = validData;
      next();
    }
  });
};

//exported middleware that validates get parameters
restaurantValidator.get = function(req, res, next) {
  //Use the schema to validate
  isvalid(req.query, getRestaurantGetSchema(), function(validationError, validData) {
    if (validationError) {
      validationError.status = 400;
      next(validationError); //Handle errors in another middleware
    } else {
      req.validQuery = validData;
      next();
    }
  });
};

//Schema that defines the accepted variations of a post body
var getRestaurantPostSchema = function() {
  return {
    type: Object,
    unknownKeys: 'deny',
    required: 'implicit',
    custom: function(data) {
      //Enforce coordinates if it's not a temporary restaurant
      if (!data.temporary && (!data.lat || !data.lng)) {
        throw new Error('Only temporary restaurants can be created without lat and lng');
      }

      //If either lat och lng is used for a temporary restaurant, the other coordinate must exist
      if (data.temporary && (data.lat || data.lng) && !(data.lat && data.lng)) {
        throw new Error('You have to use either both lat and lng or neither');
      }
      return data;
    },
    schema: {
      'name': {
        type: String,
        required: true,
        errors: {
          type: 'name must be a String',
          required: 'name is required.'
        }
      },
      'info': {
        type: String,
        required: false,
        default: null,
        errors: {
          type: 'info must be a String'
        }
      },
      'photo': {
        type: String,
        required: false,
        default: null,
        errors: {
          type: 'photo must be a URL as a string'
        }
      },
      'temporary': {
        type: Boolean,
        required: false,
        default: false,
        errors: {
          type: 'temporary must be an URL as a string'
        }
      },
      'priceRate': {
        type: Number,
        required: false,
        custom: function(data) {
          if (data && (!isInteger(data) || !isInRange(data, 1, 5))) {
            throw new Error('priceRate must be an integer between 1 and 5');
          }
          return data;
        },
        default: null,
        errors: {
          type: 'priceRate must be an integer between 1 and 5'
        }
      },
      'rating': {
        type: Number,
        required: false,
        custom: function(data) {
          if (data && (!isInteger(data) || !isInRange(data, 1, 5))) {
            throw new Error('rating must be an integer between 1 and 5');
          }
          return data;
        },
        default: null,
        errors: {
          type: 'rating must be an integer between 1 and 5'
        }
      },
      'lat': {
        type: Number,
        required: false,
        custom: function(data) {
          if (data && !isInRange(data, -180, 180)) {
            throw new Error('lat must be WGS84-formatted coordinate between -180 and 180');
          }
          return data;
        },
        default: null,
        errors: {
          type: 'lat must be WGS84-formatted coordinate between -180 and 180'
        }
      },
      'lng': {
        type: Number,
        required: false,
        custom: function(data) {
          if (data && !isInRange(data, -180, 180)) {
            throw new Error('lng must be WGS84-formatted coordinate between -180 and 180');
          }
          return data;
        },
        default: null,
        errors: {
          type: 'lng must be WGS84-formatted coordinate between -180 and 180'
        }
      },
      'categories': {
        type: Array,
        required: false,
        custom: validateCategories, //Validate all ID's in database
        default: [],
        schema: {
          type: String,
          errors: {
            type: 'categories must be an array of valid category IDs as strings',
          }
        },
        errors: {
          type: 'categories must be an array of valid category IDs as strings',
        }
      }
    }
  };
};

var getRestaurantGetSchema = function() {
  return {
    type: Object,
    unknownKeys: 'deny',
    required: 'implicit',
    custom: function(data) {
      //Enforce coordinates if radius is provided
      if (data.radius && (!data.lat || !data.lng)) {
        throw new Error('You must provide lat and lng if you use radius');
      }
      //If either lat och lng is used, the other coordinate must exist
      if ((data.lat || data.lng) && !(data.lat && data.lng)) {
        throw new Error('You have to use either both lat and lng or neither');
      }
      //set radius to 1000 if coordinates are used but radius not
      if (data.lat && data.lng && !data.radius) {
        data.radius = 1000;
      }
      return data;
    },
    schema: {
      'lat': {
        type: Number,
        required: false,
        custom: function(data) {
          if (data && !isInRange(data, -180, 180)) {
            throw new Error('lat must be WGS84-formatted coordinate between -180 and 180');
          }
          return data;
        },
        default: null,
        errors: {
          type: 'lat must be WGS84-formatted coordinate between -180 and 180'
        }
      },
      'lng': {
        type: Number,
        required: false,
        custom: function(data) {
          if (data && !isInRange(data, -180, 180)) {
            throw new Error('lng must be WGS84-formatted coordinate between -180 and 180');
          }
          return data;
        },
        default: null,
        errors: {
          type: 'lng must be WGS84-formatted coordinate between -180 and 180'
        }
      },
      'radius': {
        type: Number,
        required: false,
        custom: function(data) {
          if (data && !isInRange(data, 0, 100000)) {
            throw new Error('radius must be a number between 0 and 100 000');
          }
          return data;
        },
        default: null, //Set the default value only if coordinates are used
        errors: { //which is done in the custom validator for the whole schema
          type: 'radius must be a number between 0 and 100 000'
        }
      }
    }
  };
};


var isInRange = function(data, min, max) {
  return (typeof data === 'number' && data <= max && data >= min);
};

var isInteger = function(data) {
  return (typeof data === 'number' && (data % 1) === 0);
};

// Uses the array of category ID's from parameter "data" and selects
// the corresponding ID's from the database.
// Query will only return the ID's that actually exists, so we can match those with
// the ones in "data". Any difference between database result and "data" is
// ID's that does not exist, ie. invalid ID's
var validateCategories = function(data, schema, done) {
  if (!data || data.length === 0) {
    return done(null, []);
  }
  pg.pluck('id')
    .from('category')
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
      done(new Error('Invalid category IDs:' + data));
    });

};

module.exports = restaurantValidator;
