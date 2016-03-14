var router = require('express').Router();
var restaurantHandler = require('../datahandlers/restaurants');
var restaurantValidator = require('../validators/restaurants');

router.post('/', restaurantValidator.post, function(req, res) {
  return restaurantHandler
    .post(req)
    .then(function(response) {
      console.log('Sending data through HTTP... ' + JSON.stringify(response));
      res.send(response);
    })
    .catch(function(err) {
      res.status(500).send(err);
    });
});

module.exports = router;
