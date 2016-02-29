var expect = require('chai').expect;
var validator = require('../../../app/validators/polls');
var httpMocks = require('node-mocks-http');

// Kommentarer tack!

describe('Testing the poll validator (polls.js)', function() {
  var response;
  var request;

  before(function() {
    response = httpMocks.createResponse();
  });

  beforeEach(function() {
    request = httpMocks.createRequest({
      method: 'POST',
      url: '/polls',
    });
  });


  describe('for parameter "name"', function() {

    it('should pass for string', function(done) {

      var expected = {
        allowNewRestaurants: true,
        expires: null,
        group: null,
        name: 'restaurantname',
        restaurants: []
      };

      request.body = {
        name: 'restaurantname'
      };

      var validate = function(err) {
        if (err) {
          console.log(err);
        }
        expect(request.valid).to.deep.equal(expected);
        done();
      };
      validator.post(request, response, validate);

    });

    it('should return error for string', function(done) {
      request.body = {
        name: 123
      };

      var validate = function(err) {
        expect(err).to.be.an('object');
        done();
      };
      validator.post(request, response, validate);

    });
  });

});
