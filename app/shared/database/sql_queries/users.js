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
usersQueries.selectUserById = function(req, userId) {
  var columns;
  if (req.validUser.role === 'admin' || req.validUser.isRequestingSelf) {
    columns = ['id', 'name', 'photo', 'phone', 'admin',
      'anon', 'registration_date as registrationDate'
    ];
  } else {
    columns = ['id', 'name', 'photo'];
  }
  return knex.select(columns)
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
      return Promise.reject(new Error('Could not retreive user from database.'));
    });
};

// Get a user from db after POST-data is inserted
usersQueries.selectUsersGroups = function(req, userId) {
  if (req.validUser.role === 'admin' || req.validUser.isRequestingSelf) {
    return knex.select('id', 'name')
      .from('group')
      .join('group_users', 'group_id', 'id')
      .where('user_id', userId.toString())
      .then(function(res) {
        var groups = [];
        for (var i = 0; i < res.length; i++) {
          var group = {
            relation: 'groups',
            multiple: true,
            type: 'group',
            resource: 'groups',
            data: res[i]
          };
          groups.push(group);
        }
        return groups;
      })
      .catch(function(err) {
        console.log(err);
        return Promise.reject(new Error('Could not retreive groups from database.'));
      });
  } else {
    return null;
  }
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
