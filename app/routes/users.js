var router = require('express').Router();
var userHandler = require('../datahandlers/users');
var userValidator = require('../validators/users');

router.post('/', userValidator.post, function(req, res) {
  return userHandler
    .post(req)
    .then(function(response) {
      console.log('Sending data through HTTP... ' + JSON.stringify(response));
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

module.exports = router;
