var knex = require('../shared/knex');
var pollsDatahandler = {};
var Promise = require('bluebird');
var responseModule = require('../json_api/json_api');

pollsDatahandler.post = function(req) {
  req.validUser = 10; //TODO: Remove once auth works

  return executeInsertionTransaction(req)
    .then(createPollPostResponse);
};

var executeInsertionTransaction = function(req) {
  return knex.transaction(function(trx) {
      return insertPoll(trx, req)
        .then(function(pollid) {
          return Promise.join(
              insertRestaurants(trx, pollid, req),
              insertUsers(trx, pollid, req)
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

var createPollPostResponse = function(pollId) {
  return Promise.join(
    selectPollData(pollId),
    selectPollUsersData(pollId),
    selectRestaurantPollsData(pollId),
    selectGroupData(pollId),
    selectCreatorData(pollId),
    selectVotesData(pollId)
  ).spread(function(poll, users, restaurants, group, creator, votes) {
    var i;
    var response = new responseModule(poll);
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

var insertPoll = function(trx, req) {
  return trx('poll')
    .insert({
      creator_id: req.validUser,
      name: req.validBody.name,
      expires: req.validBody.expires,
      allow_new_restaurants: req.validBody.allowNewRestaurants,
      created: knex.raw('now()')
    })
    .returning('id');
};

var insertUsers = function(trx, pollid, req) {
  return Promise.map(req.validBody.restaurants, function(restaurantid) {
    return trx.insert({
      restaurant_id: restaurantid,
      poll_id: pollid.toString(),
    }).into('restaurant_polls');
  });
};

var insertRestaurants = function(trx, pollid, req) {
  return Promise.map(req.validBody.users, function(userid) {
    return trx.insert({
      user_id: userid,
      poll_id: pollid.toString(),
      joined: knex.raw('now()')
    }).into('poll_users');
  });
};

var selectPollData = function(pollId) {
  return knex.select('id', 'name', 'expires',
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

var selectCreatorData = function(pollId) {
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

var selectPollUsersData = function(pollId) {
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

var selectRestaurantPollsData = function(pollId) {
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

var selectGroupData = function(pollId) {
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

var selectVotesData = function(pollId) {
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
              id: res[0].restaurant_id
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

module.exports = pollsDatahandler;
