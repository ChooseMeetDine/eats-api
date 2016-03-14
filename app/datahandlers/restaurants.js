var knex = require('../shared/knex');
var pollsDatahandler = {};
var Promise = require('bluebird');
var responseModule = require('../json_api/json_api');
var _ = require('underscore');

// Handles POST requests to endpoint /restaurants
// Inserts data to database with a transaction and then selects data based on the
// returned restaurant-ID and creates a JSON-API-response with that
//
// Error handling is handled in the two promises separately, to be able to distinguish what error
// was thrown and to be able to return a useful message to the user.
pollsDatahandler.post = function(req) {
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
      return insertRestaurant(trx, req) // returns the restaurant id for the rest of the inserts
        .then(function(restaurantID) {
          return Promise.join(
              insertCategories(trx, req, restaurantID), // two more inserts to other tables
              insertRating(trx, req, restaurantID)
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
// returned, which is used to create a JSON-API-poll object and add relations to it
var createRestaurantPostResponse = function(restaurantID) {
  return Promise.join( // run all SELECTs
    selectRestaurantData(restaurantID), // returns a knex-select-promise
    selectCreatorData(restaurantID),
    selectRatingData(restaurantID),
    selectCategoryData(restaurantID),
    selectNumberOfPollsData(restaurantID),
    selectNumberOfPollsWon(restaurantID)
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
    return Promise.reject(new Error('Could insert but not retrieve poll data from database'));
  });
};

// Takes an object for an ongoing transaction and runs an INSERT query "on" that object
var insertRestaurant = function(trx, req) {
  return trx('restaurant')
    .insert({
      creator_id: req.validUser,
      name: req.validBody.name,
      info: req.validBody.info,
      lat: req.validBody.lat,
      lng: req.validBody.lng,
      price_rate: req.validBody.priceRate,
      photo: req.validBody.photo,
      temporary: req.validBody.temporary,
      created: knex.raw('now()')
    })
    .returning('id');
};

var insertCategories = function(trx, req, restaurantID) {
  return Promise.map(req.validBody.categories, function(categoryID) {
    return trx.insert({
      restaurant_id: restaurantID.toString(),
      category_id: categoryID,
    }).into('restaurant_categories');
  });
};

var insertRating = function(trx, req, restaurantID) {
  if (!req.validBody.rating) {
    return Promise.resolve();
  }
  return trx.insert({
    rater_id: req.validUser,
    rating: req.validBody.rating,
    restaurant_id: restaurantID.toString(),
    created: knex.raw('now()')
  }).into('rating');
};

var selectRestaurantData = function(restaurantID) {
  return knex.select('id', 'name', 'lat', 'created', 'info', 'photo', 'temporary',
      'lng', 'price_rate as priceRate')
    .from('restaurant')
    .where('id', restaurantID.toString())
    .then(function(res) {
      return {
        type: 'restaurant',
        resource: 'restaurants',
        data: res[0]
      };
    });
};

var selectCreatorData = function(restaurantID) {
  return knex.select('user.id', 'user.name', 'user.photo', 'anon')
    .from('user')
    .join('restaurant', {
      'restaurant.creator_id': 'user.id'
    })
    .where('restaurant.id', restaurantID.toString())
    .then(function(res) {
      return {
        type: 'user',
        relation: 'creator',
        multiple: false,
        resource: 'users',
        data: res[0]
      };
    });
};

var selectRatingData = function(restaurantID) {
  return knex.pluck('rating')
    .from('rating')
    .where('restaurant_id', restaurantID.toString())
    .then(function(res) {
      var sum = 0;
      for (var i = 0; i < res.length; i++) {
        sum += res[i];
      }
      var avg = sum / res.length;
      return avg.toFixed(1);
    });
};

var selectCategoryData = function(restaurantID) {
  return knex.select('id', 'type')
    .from('restaurant_categories')
    .join('category', 'restaurant_categories.category_id', 'category.id')
    .where('restaurant_categories.restaurant_id', restaurantID.toString())
    .then(function(res) {
      var categories = [];
      for (var i = 0; i < res.length; i++) {
        var category = {
          relation: 'categories',
          multiple: true,
          type: 'category',
          resource: 'categories',
          data: res[i]
        };
        categories.push(category);
      }
      return categories;
    });
};

var selectNumberOfPollsData = function(restaurantID) {
  return knex.select('restaurant_id')
    .from('restaurant_polls')
    .where('restaurant_id', restaurantID.toString())
    .then(function(res) {
      return res.length;
    });
};

var selectNumberOfPollsWon = function(restaurantID) {
  //This query is to complicated for me to write with knex. Hence the long string..ss
  var query = 'select count(*) from ' +
    '(select max(restaurant_id) as restaurant_id, poll_id from ' +
    '(select count(restaurant_id), poll_id, restaurant_id from ' +
    '(select vote.poll_id, restaurant_id, user_id from ' +
    '(select poll_id from restaurant_polls where restaurant_id = ' +
    restaurantID.toString() + ' ) as t1 ' +
    'join vote on vote.poll_id = t1.poll_id ' +
    'join poll on t1.poll_id = poll.id where poll.expires > now() ' +
    ') as t2 group by poll_id, restaurant_id ' +
    ') as t3 group by poll_id ' +
    ') as t4 where restaurant_id = ' + restaurantID.toString();
  return knex.raw(query)
    .then(function(res) {
      return res.rows[0].count;
    });
};
module.exports = pollsDatahandler;
