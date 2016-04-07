var knex = require('../knex');
var Promise = require('bluebird');
var pollsQueries = {};

// Inserts STANDARD POLL data into poll table
// (takes a trx-object for an ongoing transaction and runs an INSERT query "on" that object)
pollsQueries.insertPoll = function(trx, req) {
  return trx('poll')
    .insert({
      creator_id: req.validUser.id,
      name: req.validBody.name,
      expires: req.validBody.expires,
      group_id: req.validBody.group,
      allow_new_restaurants: req.validBody.allowNewRestaurants,
      created: knex.raw('now()')
    })
    .returning('id');
};

// Returns the GROUP USER IDs from the group that was specified in the poll POST request
pollsQueries.getGroupUsersForPoll = function(trx, pollid) {
  return trx.pluck('user_id')
    .from('group_users')
    .join('poll', 'poll.group_id', 'group_users.group_id')
    .where('poll.id', pollid.toString());
};

// Inserts RESTAURANT data into restaurant_polls table
pollsQueries.insertRestaurants = function(trx, req, pollid) {
  return Promise.map(req.validBody.restaurants, function(restaurantid) {
    return trx.insert({
      restaurant_id: restaurantid,
      poll_id: pollid.toString(),
    }).into('restaurant_polls');
  });
};

// Inserts USER data into poll_users table
pollsQueries.insertUsers = function(trx, req, pollid) {
  return Promise.map(req.validBody.users, function(userid) {
    return trx.insert({
      user_id: userid,
      poll_id: pollid.toString(),
      joined: knex.raw('now()')
    }).into('poll_users');
  });
};

// Inserts one RESTAURANT into restaurant_polls table (NOTE: not using transaction-object)
// Returns the restaurant id
pollsQueries.insertSingleRestaurant = function(req, pollid) {
  return knex.insert({
      restaurant_id: req.validBody.restaurantId,
      poll_id: pollid.toString(),
    })
    .into('restaurant_polls')
    .returning('restaurant_id')
    .then(function(restaurantId) {
      return restaurantId[0];
    });
};

// Inserts one VOTE into vote table (NOTE: not using transaction-object)
// and returns vote data as JSON-API object
pollsQueries.insertVote = function(req, pollid) {
  return knex.insert({
      user_id: req.validUser,
      restaurant_id: req.validBody.restaurantId,
      poll_id: pollid.toString(),
      created: knex.raw('now()'),
      updated: knex.raw('now()')
    })
    .into('vote')
    .returning('*')
    .then(function(res) {
      return {
        type: 'vote',
        resource: 'votes',
        data: {
          id: res[0].id.toString(),
          created: res[0].created,
          updated: res[0].updated
        }
      };
    });
};

// Returns STANDARD POLL data as JSON-API object
pollsQueries.selectPollData = function(pollId) {
  return knex.select('id', 'name', 'expires', 'created',
      'group_id as group', 'allow_new_restaurants as allowNewRestaurants')
    .from('poll')
    .where('id', pollId.toString())
    .then(function(res) {
      return {
        type: 'poll',
        resource: 'polls',
        data: res[0]
      };
    });
};

// Returns CREATOR data as JSON-API object
pollsQueries.selectCreatorData = function(pollId) {
  return knex.select('user.id', 'user.name', 'photo', 'anon')
    .from('user')
    .join('poll', {
      'poll.creator_id': 'user.id'
    })
    .where('poll.id', pollId.toString())
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

// Returns poll USERS data as JSON-API objects (array)
pollsQueries.selectPollUsersData = function(pollId) {
  return knex.select('user_id as id', 'name', 'photo', 'anon as anonymous')
    .from('poll_users')
    .join('user', {
      'user.id': 'user_id'
    })
    .where('poll_users.poll_id', pollId.toString())
    .then(function(res) {
      var users = [];
      for (var i = 0; i < res.length; i++) {
        var user = {
          relation: 'users',
          multiple: true,
          type: 'user',
          resource: 'users',
          data: res[i]
        };
        users.push(user);
      }
      return users;
    });
};

// Returns poll RESTAURANTS data as JSON-API objects (array)
pollsQueries.selectRestaurantPollsData = function(pollId) {
  return knex.select('id', 'name', 'lat', 'lng')
    .from('restaurant_polls')
    .join('restaurant', {
      'restaurant.id': 'restaurant_polls.restaurant_id'
    })
    .where('restaurant_polls.poll_id', pollId.toString())
    .then(function(res) {
      var restaurants = [];
      for (var i = 0; i < res.length; i++) {
        var restaurant = {
          relation: 'restaurants',
          multiple: true,
          type: 'restaurant',
          resource: 'restaurants',
          data: res[i]
        };
        restaurants.push(restaurant);
      }
      return restaurants;
    });
};

// Returns poll GROUP data as JSON-API object
pollsQueries.selectGroupData = function(pollId) {
  return knex('poll')
    .join('group', 'poll.group_id', 'group.id')
    .select('group.id', 'group.name')
    .where('poll.id', pollId.toString())
    .then(function(res) {
      if (res.length === 0) {
        return null;
      }
      return {
        relation: 'group',
        multiple: false,
        type: 'group',
        resource: 'groups',
        data: res[0]
      };
    });
};

// Returns poll VOTES data as JSON-API objects (array)
pollsQueries.selectVotesData = function(pollId) {
  return knex.select('id', 'poll_id', 'user_id', 'restaurant_id')
    .from('vote')
    .where('vote.poll_id', pollId.toString())
    .then(function(res) {

      var votes = [];
      for (var i = 0; i < res.length; i++) {
        var voteRelation = {
          data: {
            id: res[i].id,
          },
          relation: 'votes',
          multiple: true,
          type: 'vote',
          resource: 'votes',
          relationships: [{
            data: {
              id: res[i].user_id
            },
            relation: 'user',
            multiple: false,
            type: 'user',
            resource: 'users',
          }, {
            data: {
              id: res[i].restaurant_id
            },
            relation: 'restaurant',
            multiple: false,
            type: 'restaurant',
            resource: 'restaurants',
          }, {
            data: {
              id: res[i].poll_id
            },
            relation: 'poll',
            multiple: false,
            type: 'poll',
            resource: 'polls',
          }]
        };

        votes.push(voteRelation);
      }
      return votes;
    });
};

module.exports = pollsQueries;
