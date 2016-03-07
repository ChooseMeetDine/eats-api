var pg = require('../shared/knex');

var pollDataHandler = {};

var createPoll = function(req) {
  var parameters = req.valid; //These are validated parameters from the request

  return pg.select('*').from('poll');
};

pollDataHandler.post = function(req) {
  return createPoll(req)
    .then(function(result) {
      var response = {};
      response.route = result;
      response.socket = result;
      return response;
    });
};


module.exports = pollDataHandler;
