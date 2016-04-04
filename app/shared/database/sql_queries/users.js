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

// Get all users from database
usersQueries.selectAllUsers = function(req) {
  var columns;
  if (req.validUser.role === 'admin') { //Admin gets more
    columns = ['id', 'name', 'photo', 'phone', 'admin', 'anon'];
  } else {
    columns = ['id', 'name', 'photo'];
  }

  return knex.select(columns)
    .from('user')
    .then(function(res) {
      var users = [];
      for (var i = 0; i < res.length; i++) {
        var user = {
          data: res[i],
          relation: 'users',
          multiple: true,
          type: 'user',
          resource: 'users'
        };
        users.push(user);
      }
      return users;
    })
    .catch(function(err) {
      console.log(err);
      return Promise.reject(new Error('Could not retreive users from database.'));
    });
};

module.exports = usersQueries;
