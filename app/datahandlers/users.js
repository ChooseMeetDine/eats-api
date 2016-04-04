var usersDatahandler = {};
var Promise = require('bluebird');
var responseModule = require('../json_api/json_api');
var responseCollectionModule = require('../json_api/json_api_collection');
var usersQueries = require('../shared/database/sql_queries/users');

// Handles POST requests to endpoint /users
// Inserts data to database with then selects data based on the
// returned user-ID and creates a JSON-API-response with that
//
// Error handling is handled in the two promises separately, to be able to distinguish what error
// was thrown and to be able to return a useful message to the user.
usersDatahandler.post = function(req) {
  return usersQueries.insertUser(req)
    .then(createUserResponse);
};

//Creates response for GET /users
usersDatahandler.get = function(req) {
  return createAllUsersResponse(req);
};

// Get the data from usersQueries and use it to create a JSON-API-user object
var createUserResponse = function(userId) {
  return usersQueries.selectUserAfterPost(userId)
    .then(function(user) {
      return new responseModule(user); // creates a new JSON-API-user object
    });
};

// Get the data from usersQueries and use it to create a json_api_collection object
var createAllUsersResponse = function(req) {
  return usersQueries.selectAllUsers(req)
    .then(function(users) {
      var i;
      var response = new responseCollectionModule({ // creates a new JSON-API-restaurant collection
        resource: 'users'
      });
      for (i = 0; i < users.length; i++) {
        response.addObject(users[i]);
      }
      return response;
    }).catch(function(err) {
      console.log(err.stack);
      return Promise.reject(new Error('Could not retrieve user data from database'));
    });
};

module.exports = usersDatahandler;
