var knex = require('../knex');
var Promise = require('bluebird');
var usersQueries = {};

// Inserts a user into db (registration)
usersQueries.insertUser = function(req) {
  return knex('user')
    .insert({
      name: req.validBody.name,
      email: req.validBody.email,
      photo: req.validBody.photo,
      password: req.validBody.password,
      phone: req.validBody.phone,
      registration_date: knex.raw('now()'),
      last_login: knex.raw('now()')
    })
    .returning('id')
    .catch(function(err) {
      console.log(err);
      return Promise.reject(new Error('Could not insert user into database.'));
    });
};

// Get a user from db after POST-data is inserted
usersQueries.selectUserAfterPost = function(userId) {
  return knex.select('id', 'name', 'email', 'phone', 'photo', 'admin', 'anon')
    .from('user')
    .where('id', userId.toString())
    .then(function(res) {
      return {
        type: 'user',
        resource: 'users',
        data: res[0]
      };
    })
    .catch(function(err) {
      console.log(err);
      return Promise.reject(new Error('Could not insert user into database.'));
    });
};

module.exports = usersQueries;
