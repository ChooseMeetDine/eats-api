var router = require('express').Router();
var userHandler = require('../datahandlers/users');
var userValidator = require('../validators/users');
var auth = require('../validators/auth');
var env = process.env.NODE_ENV || 'development';
var access = require('../validators/access');

router.post('/', userValidator.post, function(req, res) {
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
}



module.exports = router;
