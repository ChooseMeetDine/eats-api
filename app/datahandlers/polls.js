var knex = require('../shared/knex');
var pollsDatahandler = {};
var Promise = require('bluebird');
var responseModule = require('../json_api/json_api');

pollsDatahandler.post = function(req) {
  req.validUser = 10; //TODO: Remove once auth works
  // 0. Kolla hur man gör transactions!
  // 1. INSERT poll data i 'polls' RETURNING 'id'
  // 2. INSERT user data i 'poll_users' mha poll-idt
  // 3. INSERT restaurant data i 'restaurant_polls' mha poll-idt
  // 4. SELECT data från 'polls', 'poll_users', 'restaurant_polls', 'groups' TODO: VOTES med
  // 5. skapa ett JSON-API-svar utifrån SELECT-datan
  // 6. returnera JSON-API-svaret
  var pollId;
  return knex.transaction(function(trx) {
    return insertPoll(trx, req)
      .then(function(pollid) {
        pollId = pollid;
        return Promise.join(
          insertRestaurants(trx, pollid, req),
          insertUsers(trx, pollid, req)
        );
      });
  }).then(function(res) {
    return createPollPostResponse(res, pollId, req);
  });
};

var insertPoll = function(trx, req) {
  return trx('poll')
    .insert({
      creator_id: req.validUser,
      name: req.validBody.name,
      group_id: req.validBody.group,
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


var createPollPostResponse = function(res, pollId, req) {
  return Promise.join(
    selectPollData(pollId),
    selectPollUsersData(pollId, req),
    selectRestaurantPollsData(pollId),
    selectGroupData(pollId, req),
    selectCreatorData(pollId)
  ).spread(function(poll, users, restaurants, group, creator) {
    var i;
    var response = new responseModule(poll);
    response.addRelation(creator);
    for (i = 0; i < users.length; i++) {
      response.addRelation(users[i]);
    }
    for (i = 0; i < restaurants.length; i++) {
      console.log(restaurants[i]);
      response.addRelation(restaurants[i]);
    }
    if (group) {
      response.addRelation(group);
    }
    return response;
  }).catch(function(err) {
    console.log(err.stack);
  });

};

var selectPollData = function(pollId) {
  return knex.select('id', 'creator_id as creator', 'name', 'expires',
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
      console.log('resasdasdasd');
      console.log(res);
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

var selectGroupData = function(pollId, req) {
  if (!req.validBody.group) {
    return Promise.resolve();
  }
  return knex.select('id', 'name')
    .from('group')
    .where('id', req.validBody.group) //TODO: Can this be done without req?
    .then(function(res) {
      return {
        relation: 'group',
        multiple: false,
        type: 'group',
        resource: 'groups',
        data: res[0]
      };
    });
};

module.exports = pollsDatahandler;
