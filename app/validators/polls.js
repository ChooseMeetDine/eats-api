var isvalid = require('isvalid');
var pg = require('../shared/database/knex');
var moment = require('moment');
var _ = require('underscore');

var pollValidator = {};

// Exported middleware that validates a POST body to /polls
pollValidator.post = function(req, res, next) {
  //Use the schema to validate
  isvalid(req.body, getPollPostSchema(), function(validationError, validData) {
    if (validationError) {
      validationError.status = 400;
      next(validationError); //Handle errors in another middleware
    } else {
      req.validBody = validData;
      next();
    }
  });
};

// Exported middleware that validates the ID-parameter for /polls/:id
pollValidator.checkPollId = function(req, res, next) {
  //No schema needed to validate a single parameter
  validatePollID(req.params.id)
    .then(function(id) {
      req.validParams = {
        id: id
      };
      next();
    })
    .catch(function(error) {
      error.status = 400;
      next(error);
    });
};

// Exported middleware that validates a POST body to /polls/:id/restaurants
pollValidator.postRestaurant = function(req, res, next) {
  // Use the schema for POST restaurant to validate
  isvalid(
    req.body,
    getPollPostRestaurantSchema(req.validParams.id),
    function(validationError, validData) {
      if (validationError) {
        next(validationError); //Handle errors in another middleware
      } else {
        req.validBody = validData;
        next();
      }
    });
};

// Exported middleware that validates a POST body to /polls/:id/votes
pollValidator.postVote = function(req, res, next) {
  // Use the schema for POST restaurant to validate
  isvalid(
    req.body,
    getPollPostVoteSchema(req.validParams.id),
    function(validationError, validData) {
      if (validationError) {
        next(validationError); //Handle errors in another middleware
      } else {
        req.validBody = validData;
        next();
      }
    });
};

// Exported middleware that validates if a user is a participant in the poll or not
// for POSTs to /polls/:id/votes
pollValidator.checkIfParticipant = function(req, res, next) {
  validateIfUserIsParticipant(req.params.id, req.validUser.id)
    .then(function(isParticipant) {
      if (isParticipant === true) {
        req.validUser.isParticipant = true;
        next();
      } else  {
        return Promise.reject(new Error('User ID ' + userId + ' is not a participant of poll ID ' +
          pollId));
      }
    })
    .catch(function(error) {
      error.status = 400;
      next(error);
    });
};

// Exported middleware that validates if a user has voted in the poll before,
// for POSTs to /polls/:id/votes
pollValidator.checkThatUserHasntVoted = function(req, res, next) {
  //No schema needed to validate a single parameter
  validateThatUserHasntVoted(req.params.id, req.validUser.id)
    .then(function() {
      next();
    })
    .catch(function(error) {
      error.status = 400;
      next(error);
    });
};

//Schema that defines the accepted variations of a post body
var getPollPostSchema = function() {
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
        default: [], //defaults to empty array
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
      return done(new Error('Invalid group ID:' + data));
    });
};

// Check if the ID exists in database
var validatePollID = function(id) {
  return pg.schema //Returns rows-object as either: [{exists:true}] or [{exists:false}]
    .raw('select exists(select 1 from "poll" where id=' + id + ') AS "exists"')
    .catch(function() {
      return Promise.reject(new Error(id + ' is not a valid poll ID'));
    })
    .then(function(res) {
      if (res.rows[0].exists) {
        return id;
      }
      return Promise.reject(new Error(id + ' is not a valid poll ID'));
    });
};

// Schema to validate a POST for /polls/<id>/restaurants
// Takes the poll-ID as parameter to be able to check with the DB if the restaurant
// is not already added to the poll.
var getPollPostRestaurantSchema = function(pollId) {
  return {
    type: Object,
    unknownKeys: 'deny', //Send error for parameters that does not exist in this schema
    required: 'implicit', //Parent of required parameter becomes required.
    options: {
      pollId: pollId
    },
    custom: checkIfRestaurantsCanBeAddedToPoll,
    schema: {
      'restaurantId': {
        type: String, //Has to be a string
        required: true, //is required
        options: {
          pollId: pollId
        },
        custom: validateRestaurantIdAndIfUniqueToPoll,
        errors: {
          type: 'restaurantId must be a String', //error if type: String throws error
          required: 'restaurantId is required.' //error if restaurantId is not present
        }
      }
    }
  };
};

// Check if poll allows new restaurants
var checkIfRestaurantsCanBeAddedToPoll = function(data, schema, done) {
  return pg.select('allow_new_restaurants as allowNewRestaurants')
    .from('poll')
    .where('id', schema.options.pollId)
    .then(function(res) {
      if (res[0] && res[0].allowNewRestaurants) {
        return done(null, data);
      }
      return done(new Error('Poll ID ' + schema.options.pollId +
        ' does not accept restaurants to be added'));
    });
};

// Check if a restaurant ID is valid and has not been added to the poll before
var validateRestaurantIdAndIfUniqueToPoll = function(data, schema, done) {
  if (!data || data.length === 0) {
    return done(new Error('Restaurant ID cannot be empty'));
  }
  pg.select('id')
    .from('restaurant')
    .where('id', data)
    .then(function(res) {
      if (_.isEmpty(res)) { // if res is an empty array, the ID wasn't found in DB
        return done(new Error(data + ' is not a valid restaurant ID'));
      }

      // Check if restaurant is already added to the poll
      pg.select('*')
        .from('restaurant_polls')
        .where('poll_id', schema.options.pollId)
        .andWhere('restaurant_id', data)
        .then(function(res) {
          if (_.isEmpty(res)) { // if res is empty the restaurant wasn't added before - good to go
            return done(null, data);
          }
          return done(new Error('Restaurant ID ' + data + ' already exist in the poll'));
        });
    })
    .catch(function(err) {
      console.log(err);
      return done(new Error('Invalid restaurant ID: ' + data));
    });
};

// Schema to validate a POST for /polls/<id>/votes
var getPollPostVoteSchema = function(pollId) {
  return {
    type: Object,
    unknownKeys: 'deny', //Send error for parameters that does not exist in this schema
    required: 'implicit', //Parent of required parameter becomes required.
    options: {
      pollId: pollId
    },
    custom: checkIfVoteCanBeAddedToPoll,
    schema: {
      'restaurantId': {
        type: String, //Has to be a string
        required: true, //is required
        custom: validateRestaurantId,
        errors: {
          type: 'restaurantId must be a String', //error if type: String throws error
          required: 'restaurantId is required.' //error if restaurantId is not present
        }
      }
    }
  };
};

// Check if the poll allows new votes to be added (that the poll isn't over)
var checkIfVoteCanBeAddedToPoll = function(data, schema, done) {
  return pg.select('expires')
    .from('poll')
    .where('id', schema.options.pollId)
    .then(function(res) {
      // Check that the poll hasn't expired ('expires' is after now())
      var now = moment();
      if (res[0] && moment(res[0].expires).isAfter(now)) {
        return done(null, data);
      }
      return done(new Error('Poll ID ' + schema.options.pollId +
        ' has expired and does not allow new votes: ' + res[0].expires));
    });
};

// Check if a restaurant ID is valid (if it exists in DB)
var validateRestaurantId = function(data, schema, done) {
  if (!data || data.length === 0) {
    return done(new Error('Restaurant ID cannot be empty'));
  }
  pg.select('id')
    .from('restaurant')
    .where('id', data)
    .then(function(res) {
      if (_.isEmpty(res)) { // if res is an empty array, the ID wasn't found in DB
        return done(new Error(data + ' is not a valid restaurant ID'));
      }
      return done(null, data);
    })
    .catch(function(err) {
      console.log(err);
      return done(new Error('Invalid restaurant ID: ' + data));
    });
};

// Check if user ID is participant in a specific poll
// Returns true or false
var validateIfUserIsParticipant = function(pollId, userId) {
  return pg.schema //Returns either: [{isParticipant:true}] or [{isParticipant:false}]
    .raw('SELECT EXISTS(SELECT 1 FROM "poll_users" WHERE poll_id=' +
      pollId + ' AND user_id=' + userId + ' ) AS "isParticipant"')
    .catch(function() {
      return Promise.reject(new Error('Something went wrong with the database when trying to ' +
        'check if user ID ' + userId + ' is a participant of poll ID ' + pollId));
    })
    .then(function(res) {
      if (res.rows[0] && res.rows[0].isParticipant) {
        return true;
      } else {
        return false;
      }
    });
};

// Checks if user hasn't voted in the poll before
// Returns true if not voted before, otherwise throws error
var validateThatUserHasntVoted = function(pollId, userId) {
  return pg.schema //Returns rows-object as either: [{canVote:true}] or [{canVote:false}]
    .raw('SELECT NOT EXISTS(SELECT 1 FROM "vote" WHERE poll_id=' +
      pollId + ' AND user_id=' + userId + ' ) AS "canVote"')
    .catch(function() {
      return Promise.reject(new Error('User ID ' + userId + ' has already voted in poll ID ' +
        pollId));
    })
    .then(function(res) {
      if (res.rows[0] && res.rows[0].canVote) {
        return true;
      }
      return Promise.reject(new Error('User ID ' + userId + ' has already voted in poll ID ' +
        pollId));
    });
};

module.exports = pollValidator;
