var router = require('express').Router();
var pollHandler = require('../datahandlers/polls');
var pollValidator = require('../validators/polls');

router.post('/', pollValidator.post, function(req, res) {
  return pollHandler
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
router.post('/', pollValidator.getID, function(req, res) {
  return pollHandler
    .getID(req)
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
