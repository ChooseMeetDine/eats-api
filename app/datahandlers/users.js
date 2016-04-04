var usersDatahandler = {};
var Promise = require('bluebird');
var responseModule = require('../json_api/json_api');
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



// Get the data from usersQueries and use it to create a JSON-API-user object
var createUserResponse = function(userId) {
  return usersQueries.selectUserAfterPost(userId)
    .then(function(user) {
      return new responseModule(user); // creates a new JSON-API-user object
    }).catch(function(err) {
      console.log(err.stack);
      return Promise.reject(new Error('Could insert but not retrieve user data from database'));
    });
};
module.exports = usersDatahandler;
