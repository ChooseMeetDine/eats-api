var Promise = require('bluebird');
var pg = require('../shared/knex');

var pollDataHandler = {};

var createPoll = function(req) {
  var parameters = req.valid;

  return pg.select('*').from('user');
};

pollDataHandler.post = function(req) {
  return createPoll(req)
    .then(function(result) {
      var response = {};
      console.log(result);
      response.route = result;
      response.socket = result;
      return response;
    });
};


module.exports = pollDataHandler;
