var knex = require('../knex');
var Promise = require('bluebird');
var restaurantsQueries = {};

// Takes an object for an ongoing transaction and runs an INSERT query "on" that object
restaurantsQueries.insertRestaurant = function(trx, req) {
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

restaurantsQueries.insertCategories = function(trx, req, restaurantID) {
  return Promise.map(req.validBody.categories, function(categoryID) {
    return trx.insert({
      restaurant_id: restaurantID.toString(),
      category_id: categoryID,
    }).into('restaurant_categories');
  });
};

restaurantsQueries.insertRating = function(trx, req, restaurantID) {
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

restaurantsQueries.selectRestaurantData = function(restaurantID) {
  var ratingQuery = '(select restaurant_id, avg(rating) as' +
    ' rating from rating group by restaurant_id) as t1';

  return knex.select('id', 'name', 'lat', 'created', 'info', 'photo', 'temporary',
      'lng', 'price_rate as priceRate', 'status', 'rating')
    .from('restaurant')
    .join(knex.raw(ratingQuery), 'restaurant_id', 'id')
    .where('id', restaurantID.toString())
    .then(function(res) {
      res[0].rating = parseFloat(parseFloat(res[0].rating).toFixed(1));
      return {
        type: 'restaurant',
        resource: 'restaurants',
        data: res[0]
      };
    });
};

//With lat, lng, radius
restaurantsQueries.selectMultipleRestaurantsByLocation = function(req) {

  var dbLoc = 'ST_SetSRID(ST_MakePoint(lng,lat),4326)::geography';
  var userLoc = 'ST_GeogFromText(\'SRID=4326;POINT(' + req.validQuery.lng + ' ' +
    req.validQuery.lat + ')\')';
  var locationQuery = 'ST_DWithin( ' + dbLoc + ', ' + userLoc + ', ' + req.validQuery.radius + ')';

  var ratingQuery = '(select restaurant_id, avg(rating) as' +
    ' rating from rating group by restaurant_id) as t1';

  return knex.select('id', 'name', 'lat', 'created', 'info', 'photo', 'temporary',
      'lng', 'price_rate as priceRate', 'status', 'rating')
    .from('restaurant')
    .join(knex.raw(ratingQuery), 'restaurant_id', 'id')
    //.where(knex.raw(locationQuery)) TODO: Fix this when new database is up and running
    .then(function(res) {
      var restaurants = [];
      for (var i = 0; i < res.length; i++) {
        res[i].rating = parseFloat(parseFloat(res[i].rating).toFixed(1));
        var restaurant = {
          data: res[i],
          relation: 'votes',
          multiple: true,
          type: 'vote',
          resource: 'votes'
        };
        restaurants.push(restaurant);
      }
      return restaurants;
    });
};

//without parameters
restaurantsQueries.selectAllRestaurants = function() {
  var ratingQuery = '(select restaurant_id, avg(rating) as' +
    ' rating from rating group by restaurant_id) as t1';

  return knex.select('id', 'name', 'lat', 'created', 'info', 'photo', 'temporary',
      'lng', 'price_rate as priceRate', 'status', 'rating')
    .from('restaurant')
    .join(knex.raw(ratingQuery), 'restaurant_id', 'id')
    .then(function(res) {
      var restaurants = [];
      for (var i = 0; i < res.length; i++) {
        res[i].rating = parseFloat(parseFloat(res[i].rating).toFixed(1));
        var restaurant = {
          data: res[i],
          relation: 'votes',
          multiple: true,
          type: 'vote',
          resource: 'votes'
        };
        restaurants.push(restaurant);
      }
      return restaurants;
    });
};

restaurantsQueries.selectCreatorData = function(restaurantID) {
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

restaurantsQueries.selectCategoryData = function(restaurantID) {
  return knex.select('id', 'type as name')
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

//How many polls this restaurant has been part of
restaurantsQueries.selectNumberOfPollsData = function(restaurantID) {
  return knex.select('restaurant_id')
    .from('restaurant_polls')
    .where('restaurant_id', restaurantID.toString())
    .then(function(res) {
      return res.length;
    });
};

restaurantsQueries.selectNumberOfPollsWon = function(restaurantID) {
  //This query is to complicated for me to write with knex. Hence the long string..
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
restaurantsQueries.appendCategories = function(restaurants) {
  return Promise.map(restaurants, function(restaurant) {
    return knex.select('id', 'type as name')
      .from('restaurant_categories')
      .join('category', 'restaurant_categories.category_id', 'category.id')
      .where('restaurant_categories.restaurant_id', restaurant.data.id)
      .then(function(res) {
        restaurant.relationships = [];
        for (var i = 0; i < res.length; i++) {
          var category = {
            relation: 'categories',
            multiple: true,
            type: 'category',
            resource: 'categories',
            data: res[i]
          };
          restaurant.relationships.push(category);
        }
        return restaurant;
      });
  });
};

module.exports = restaurantsQueries;
