var Promise = require('bluebird');

var responseModule = require('../json_api/json_api');
var pollsSelectQueries = require('../shared/database/sql_queries/polls');

var pollsSocket = {};
var io = {}; // used to save the incoming socketio-object in function init()

// Initializes the socket module.
// Must be run before anything else is done with this module
pollsSocket.init = function(incomingIo) {
  io = incomingIo; // save the incoming socketio object

  // Logging every new socket connection
  io.on('connection', function(socket) {
    console.log('connection socket io' + socket);
  });
};

// Fetches the most up to date poll data from the database,
// creates a JSON-API response from that data
// and sends the response via SocketIO using the pollID as channel
pollsSocket.fetchAndSendNewPollData = function(pollId) {
  // Gets all data from DB and puts it JSON-API-module-ready objects
  return Promise.join(
      pollsSelectQueries.selectPollData(pollId), // returns a knex-select-promise
      pollsSelectQueries.selectPollUsersData(pollId),
      pollsSelectQueries.selectRestaurantPollsData(pollId),
      pollsSelectQueries.selectGroupData(pollId),
      pollsSelectQueries.selectCreatorData(pollId),
      pollsSelectQueries.selectVotesData(pollId)
    )
    // Creates a JSON-API response using the data from DB
    .spread(function(poll, users, restaurants, group, creator, votes) {
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

      // Send JSON to connected Socket-clients using the pollId as channel
      return io.sockets.emit(pollId, response);
    }).catch(function(err) {
      console.log(err.stack);
      return Promise.reject(new Error('Could not receive poll data to send via SocketIO'));
    });
};

module.exports = pollsSocket;
