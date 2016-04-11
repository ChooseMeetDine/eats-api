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
    .then(function(userId) {
      if (!req.validUser) { //After POST, user requests data about him/her self.
        req.validUser = {}; //To resuse createUserIdResponse, set: isRequestingSelf = true;
      }
      req.validUser.isRequestingSelf = true;
      return createUserIdResponse(req, userId);
    });
};

//Creates response for GET /users
usersDatahandler.get = function(req) {
  return createAllUsersResponse(req);
};

//Creates response for GET /users/:id
usersDatahandler.getId = function(req) {
  return createUserIdResponse(req, req.validParams.id);
};

// Get the data from usersQueries and use it to create a JSON-API-user object
var createUserIdResponse = function(req, userId) {
  return Promise.join(
      usersQueries.selectUserById(req, userId),
      usersQueries.selectUsersGroups(req, userId))
    .spread(function(user, groups) {
      var userModel = new responseModule(user); // creates a new JSON-API-user object
      if (groups) {
        for (var i = 0; i < groups.length; i++) {
          userModel.addRelation(groups[i]);
        }
      }
      return userModel;
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
    });
};

module.exports = usersDatahandler;
