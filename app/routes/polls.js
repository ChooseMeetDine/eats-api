var router = require('express').Router();
var pollHandler = require('../datahandlers/polls');
var pollValidator = require('../validators/polls');
var socketio = require('../socketio/polls_socket');

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

router.get('/', function(req, res) {
  return pollHandler
    .get(req)
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

router.get('/:id', pollValidator.getID, function(req, res) {
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

// Router that handles POSTs to add restaurants to a poll
// Sends the updated poll-data via socketio when successfull
router.post('/:id/restaurants',
  pollValidator.getID, // validate poll ID parameter
  pollValidator.postRestaurant, // validate POST body for restaurant
  function(req, res) {
    return pollHandler
      .postRestaurant(req)
      .then(function(response) {
        console.log('Sending data through HTTP... ' + JSON.stringify(response));
        socketio.fetchAndSendNewPollData(req.validParams.id); // send new poll data via socketio

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
