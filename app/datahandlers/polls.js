var knex = require('../shared/database/knex');
var pollsDatahandler = {};
var Promise = require('bluebird');
var responseModule = require('../json_api/json_api');
var _ = require('underscore');
var pollsQueries = require('../shared/database/sql_queries/polls');

// Handles POST requests to endpoint /poll
// Inserts data to database with a transaction and then selects data based on the
// returned poll-ID and creates a JSON-API-response with that
//
// Error handling is handled in the two promises separately, to be able to distinguish what error
// was thrown and to be able to return a useful message to the user.
pollsDatahandler.post = function(req) {
  req.validUser = 10; //TODO: Remove once auth works

  return executeInsertionTransaction(req)
    .then(createPollPostResponse);
};

// Executes several INSERT to the database as a transaction,
// so if one insertion fails, everything is rolled back to the previous state.
//
// The function creates a new transaction-object and sends that object to other functions
// for them to add queries to that object (just a way to split this function to smaller parts)
var executeInsertionTransaction = function(req) {
  return knex.transaction(function(trx) {
      // Inserts poll data into the poll table in DB
      return pollsQueries.insertPoll(trx, req)
        .then(function(pollid) {
          // No group specified, skip adding group users
          if (!req.validBody.group) {
            return Promise.resolve(pollid); // returns the poll-id needed for the rest of the inserts
          }
          // If group is specified in request, add the users for that group to the users in the poll
          // This has to be done before insertUsers()
          return pollsQueries.getGroupUsersForPoll(trx, pollid)
            // Add groupUsers as users to the poll:
            .then(function(groupUsers) {
              req.validBody.users = _.union(req.validBody.users, groupUsers);
              return Promise.resolve(pollid);
            });
        })
        .then(function(pollid) {
          // Inserts data into two more tables in DB
          return Promise.join(
              pollsQueries.insertRestaurants(trx, req, pollid),
              pollsQueries.insertUsers(trx, req, pollid)
            )
            .then(function() {
              return Promise.resolve(pollid);
            });
        });
    })
    .catch(function(error) {
      console.log(error.stack);
      return Promise.reject(new Error('Could not insert poll data into database'));
    });
};

// Executes several SELECT queries to the database and creates an object for each type of data
// returned, which is used to create a JSON-API-poll object and add relations to it
var createPollPostResponse = function(pollId) {
  return Promise.join( // run all SELECTs
    pollsQueries.selectPollData(pollId), // returns a knex-select-promise
    pollsQueries.selectPollUsersData(pollId),
    pollsQueries.selectRestaurantPollsData(pollId),
    pollsQueries.selectGroupData(pollId),
    pollsQueries.selectCreatorData(pollId),
    pollsQueries.selectVotesData(pollId)
  ).spread(function(poll, users, restaurants, group, creator, votes) {
    var i;
    var response = new responseModule(poll); // creates a new JSON-API-poll object
    response.addRelation(creator);
    for (i = 0; i < users.length; i++) {
      response.addRelation(users[i]);
    }
    for (i = 0; i < restaurants.length; i++) {
      response.addRelation(restaurants[i]);
    }
    if (group) {
      response.addRelation(group);
    }
    for (i = 0; i < votes.length; i++) {
      response.addRelation(votes[i]);
    }
    return response;
  }).catch(function(err) {
    console.log(err.stack);
    return Promise.reject(new Error('Could insert but not retrieve poll data from database'));
  });
};

module.exports = pollsDatahandler;
