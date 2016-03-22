var router = require('express').Router();
var bodyParser = require('body-parser');
var knex = require('../shared/database/knex');

router.use(bodyParser.urlencoded({
  extended: true
}));

var access = {};

access.toAdmin = function(req, res, next) {
  var admin = req.validUser.admin;
  if (admin) {
    next();
  } else {
    res.status(403).json({
      error: 'no admin error',
      message: 'Try logging is admin to access route'
    });
  }
};

access.typeOfUser = function(req, res, next) {

};

access.toGroupCreator = function(req, res, next) {
  knex.select('*').from('group').where('creator_id', '=', req.validUser.id)
    .then(function(result) {
      if (req.validUser.id === result[0].creator_id) {
        req.validData = result[0];
        console.log(req.validData);
        next();
      }
    }).catch(function() {
      res.status(403).json({
        error: 'no group creator error',
        message: 'Try creating the group to access route'
      });
    });
};

access.toPollCreator = function(req, res, next) {
  knex.select('*').from('poll').where('creator_id', '=', req.validUser.id)
    .then(function(result) {
      if (req.validUser.id === result[0].creator_id) {
        next();
      }
    }).catch(function() {
      res.status(403).json({
        error: 'no poll creator error',
        message: 'Try creating the poll to access route'
      });
    });
};

module.exports = access;
