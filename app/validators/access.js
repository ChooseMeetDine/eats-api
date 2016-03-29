var router = require('express').Router();
var bodyParser = require('body-parser');
var knex = require('../shared/database/knex');

router.use(bodyParser.urlencoded({
  extended: true
}));

var access = {};

//If user is admin, grant access.
access.toAdmin = function(req, res, next) {
  var admin = req.validUser.admin;
  if (admin) {
    next();
  } else {
    res.status(401).json({
      'errors': [
        {
          'status': '401',
          'title': 'Unathourized',
          'detail': 'ID is not administrator.'
        }
      ]
    });
  }
};

//Set user role.
access.setRoleForGetUserId = function(req, res, next) {
  knex.select('*').from('user').where('id', '=', req.validUser.id)
    .then(function() {
      if (req.validUser.admin) {
        req.validUser.role = 'admin';
        next();
      } else if (req.validUser.anon === false) {
        req.validUser.role = 'user';
        next();
      } else {
        req.validUser.role = 'anonymous';
        next();
      }
    }).catch(function() {
      res.status(401).json({
        'errors': [
          {
            'status': '401',
            'title': 'Unathourized',
            'detail': 'ID does not exist.'
          }
        ]
      });
    });
};

access.setRoleForGetPoll = function(req, res, next) {
  knex.select('*').from('poll').where('creator_id', '=', req.validUser.id)
    .then(function(result) {
      if (req.validUser.admin) {
        next();
      } else if (req.validUser.id === result[0].creator_id) {
        req.validUser.role = 'creator';
        next();
      } else {
        req.validUser.role = ' user';
      }
    }).catch(function() {
      res.status(400).json({
        'errors': [
          {
            'status': '401',
            'title': 'Unathourized',
            'detail': 'ID does not exist in poll.'
          }
        ]
      });
    });
};

access.setRoleForGetGroup = function(req, res, next) {
  knex.select('*').from('group').where('creator_id', '=', req.validUser.id)
    .then(function(result) {
      if (req.validUser.admin) {
        next();
      } else if (req.validUser.id === result[0].creator_id) {
        req.validUser.role = 'creator';
        next();
      } else {
        req.validUser.role = ' user';
      }
    }).catch(function() {
      res.status(400).json({
        'errors': [
          {
            'status': '401',
            'title': 'Unathourized',
            'detail': 'ID does not exist in group.'
          }
        ]
      });
    });
};

/*
access.toUserData = function(req, res, next) {

  usersAllArray = [];
  usersRestrictedArray = [];

  knex.select('*').from('user')
    .then(function(result) {
      if (req.validUser.admin === true) {
        for (i = 0; i < result.length; i++) {
          var userAll = {
            id: result[i].id,
            name: result[i].name,
            email: result[i].email,
            photo: result[i].photo,
            last_login: result[i].last_login,
            registration_date: result[i].registration_date,
            admin: result[i].admin,
            phone: result[i].phone,
            anon: result[i].anon
          };

          usersAllArray.push(userAll);
        }

        //User object data result is set to to request object.
        req.userDataAll = usersAllArray;
        next();
      } else if (req.validUser.admin === false) {
        for (i = 0; i < result.length; i++) {
          var userRestricted = {
            id: result[i].id,
            name: result[i].name,
            anon: result[i].anon
          };

          usersRestrictedArray.push(userRestricted);
        }

        //User object data result is set to to request object.
        req.userDataRestricted = usersRestrictedArray;
        next();
      }
    }).catch(function(e) {
      console.log(e);
      res.status(500).json({
        message: 'error'
      });
    });
};*/

module.exports = access;
