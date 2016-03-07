var knex = require('../shared/knex');
var pollsDatahandler = {};
var Promise = require('bluebird');

Promise.config({
  // Enable warnings
  warnings: true,
  // Enable long stack traces
  longStackTraces: true,
  // Enable cancellation
  cancellation: true,
  // Enable monitoring
  monitoring: true
});

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

pollsDatahandler.post = function(req) {
  // 0. Kolla hur man gör transactions!
  // 1. INSERT poll data i 'polls' RETURNING 'id'
  // 2. INSERT user data i 'poll_users' mha poll-idt
  // 3. INSERT restaurant data i 'restaurant_polls' mha poll-idt
  // 4. SELECT data från 'polls', 'poll_users', 'restaurant_polls', 'groups'
  // 5. skapa ett JSON-API-svar utifrån SELECT-datan
  // 6. returnera JSON-API-svaret

  return knex.transaction(function(trx) {
    return insertPoll(trx, req);
    // .then(function(pollid) {
    //   return Promise.join(
    //     insertRestaurants(trx, pollid, req),
    //     insertUsers(trx, pollid, req)
    //   );
    // });
  });

};

module.exports = pollsDatahandler;
