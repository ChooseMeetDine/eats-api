var knex = require('../shared/database/knex');
var restaurantDatahandler = {};
var Promise = require('bluebird');
var responseModule = require('../json_api/json_api');
var queries = require('../shared/database/sql_queries/restaurants');

// Handles POST requests to endpoint /restaurants
// Inserts data to database with a transaction and then selects data based on the
// returned restaurant-ID and creates a JSON-API-response with that
//
// Error handling is handled in the two promises separately, to be able to distinguish what error
// was thrown and to be able to return a useful message to the user.
restaurantDatahandler.post = function(req) {
  req.validUser = 10; //TODO: Remove once auth works

  return executeInsertionTransaction(req)
    .then(createRestaurantPostResponse);
};

// Executes several INSERT to the database as a transaction,
// so if one insertion fails, everything is rolled back to the previous state.
//
// The function creates a new transaction-object and sends that object to other functions
// for them to add queries to that object (just a way to split this function to smaller parts)
var executeInsertionTransaction = function(req) {
  return knex.transaction(function(trx) {
      return queries.insertRestaurant(trx, req) // returns the restaurant id for following inserts
        .then(function(restaurantID) {
          return Promise.join(
              queries.insertCategories(trx, req, restaurantID), // two more inserts to other tables
              queries.insertRating(trx, req, restaurantID)
            )
            .then(function() {
              return Promise.resolve(restaurantID);
            });
        });
    })
    .catch(function(error) {
      console.log(error.stack);
      return Promise.reject(new Error('Could not insert restaurant data into database'));
    });
};

// Executes several SELECT queries to the database and creates an object for each type of data
// returned, which is used to create a JSON-API-restaurant object and add relations to it
var createRestaurantPostResponse = function(restaurantID) {
  return Promise.join( // run all SELECTs
    queries.selectRestaurantData(restaurantID), // returns a knex-select-promise
    queries.selectCreatorData(restaurantID),
    queries.selectRatingData(restaurantID),
    queries.selectCategoryData(restaurantID),
    queries.selectNumberOfPollsData(restaurantID),
    queries.selectNumberOfPollsWon(restaurantID)
  ).spread(function(restaurant, creator, rating, categories, pollCount, wonCount) {
    var i;
    restaurant.data.rating = rating; //Rating is just a number for now
    restaurant.data.numberOfPolls = pollCount;
    restaurant.data.numberOfPollsWon = wonCount;
    var response = new responseModule(restaurant); // creates a new JSON-API-restaurant object
    response.addRelation(creator);
    for (i = 0; i < categories.length; i++) {
      response.addRelation(categories[i]);
    }
    return response;
  }).catch(function(err) {
    console.log(err.stack);
    return Promise.reject(new Error('Could insert but not retrieve restaurant data from database'));
  });
};

module.exports = restaurantDatahandler;
