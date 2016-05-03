var router = require('express').Router();
var userHandler = require('../datahandlers/users');
var userValidator = require('../validators/users');
var auth = require('../validators/auth');
var env = process.env.NODE_ENV || 'development';
var access = require('../validators/access');
var encrypt = require('../shared/encryption');

router.post('/', userValidator.post, encrypt.encryptPassword, function(req, res) {
  return userHandler
    .post(req)
    .then(function(response) {
      res.send(response);
    })
    .catch(function(err) {
      res.status(500).send({
        httpStatus: 500,
        error: err.message,
        stack: err.stack
      });
    });
});

//No tokens needed for development
if (env === 'development') {
  router.get('/', function(req, res) {
    return userHandler
      .get(req)
      .then(function(response) {
        res.send(response);
      })
      .catch(function(err) {
        res.status(500).send({
          httpStatus: 500,
          error: err.message,
          stack: err.stack
        });
      });
  });

  router.get('/:id', userValidator.getId, function(req, res) {
    return userHandler
      .getId(req)
      .then(function(response) {
        res.send(response);
      })
      .catch(function(err) {
        res.status(500).send({
          httpStatus: 500,
          error: err.message,
          stack: err.stack
        });
      });
  });
} else {
  router.get('/', auth.validate, access.setRoleForUser, function(req, res) {
    return userHandler
      .get(req)
      .then(function(response) {
        res.send(response);
      })
      .catch(function(err) {
        res.status(500).send({
          httpStatus: 500,
          error: err.message,
          stack: err.stack
        });
      });
  });

  router.get('/:id',
    auth.validate, //Validate user and set req.validUser
    access.setRoleForUser, //Set req.validUser.role
    userValidator.getId, //Validate that the user ID in request exists in DB and set req.validParams
    userValidator.checkIfRequestingSelf, //Check if id in validParams and validUser is the same
    function(req, res) {
      return userHandler
        .getId(req)
        .then(function(response) {
          res.send(response);
        })
        .catch(function(err) {
          res.status(500).send({
            httpStatus: 500,
            error: err.message,
            stack: err.stack
          });
        });
    });
}



module.exports = router;
