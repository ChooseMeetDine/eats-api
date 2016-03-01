var expect = require('chai').expect;
var validator = require('../../../app/validators/polls');
var httpMocks = require('node-mocks-http');
var moment = require('moment');
var mockDb = require('mock-knex');
var knex = require('knex');
var db = knex({
  client: 'pg',
});

mockDb.mock(db);

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

  describe('testing default values for non required parameters', function() {

    var defaultValues;

    before(function(done) {
      request = httpMocks.createRequest({
        method: 'POST',
        url: '/polls',
      });
      request.body = {
        name: 'restaurantname'
      };

      var validate = function(err) {
        if (err) {
          console.log(err);
        }
        defaultValues = request.validBody;
        done();
      };
      validator.post(request, response, validate);

    });

    it('should set allowNewRestaurants to true', function() {
      expect(defaultValues.allowNewRestaurants).to.equal(true);
    });

    it('should set expires to an object', function() {
      var twentyMinutesLater = moment(defaultValues.expires);
      var diff = twentyMinutesLater.diff(moment(), 'minutes');
      expect(diff).to.be.within(19, 21);
    });

    it('should set group to null', function() {
      expect(defaultValues.group).to.equal(null);
    });

    it('should set restaurants to an empty array', function() {
      expect(defaultValues.restaurants).to.deep.equal([]);
    });
  });


  describe('for parameter "name"', function() {

    it('should pass for string', function(done) {

      request.body = {
        name: 'restaurantname'
      };

      var validate = function(err) {
        if (err) {
          console.log(err);
        }
        expect(request.validBody.name).to.equal('restaurantname');
        done();
      };
      validator.post(request, response, validate);

    });

    it('should return error for number', function(done) {
      request.body = {
        name: 123
      };

      var validate = function(err) {
        expect(err).to.be.an('object');
        done();
      };
      validator.post(request, response, validate);

    });

    it('should return error for null', function(done) {
      request.body = {
        name: null
      };

      var validate = function(err) {
        expect(err).to.be.an('object');
        done();
      };
      validator.post(request, response, validate);

    });

    it('should return error for undefined', function(done) {
      request.body = {
        name: undefined
      };

      var validate = function(err) {
        expect(err).to.be.an('object');
        done();
      };
      validator.post(request, response, validate);

    });

    it('should return error for boolean true', function(done) {
      request.body = {
        name: true
      };

      var validate = function(err) {
        expect(err).to.be.an('object');
        done();
      };
      validator.post(request, response, validate);

    });
  });

  describe('for parameter "expires"', function() {

    it('should pass for "2019-05-19 14:39:22+0600"', function(done) {

      request.body = {
        name: 'restaurantname', //name is required
        expires: '2019-05-19 14:39:22+0600'

      };

      var validate = function(err) {
        expect(err).to.equal(undefined);
        done();
      };
      validator.post(request, response, validate);

    });

    it('should pass for "2019-05-19"', function(done) {

      request.body = {
        name: 'restaurantname', //name is required
        expires: '2019-05-19'

      };

      var validate = function(err) {
        expect(err).to.equal(undefined);
        done();
      };
      validator.post(request, response, validate);

    });

    it('should pass for "2016-W21-2T01:22"', function(done) {

      request.body = {
        name: 'restaurantname', //name is required
        expires: '2016-W21-2T01:22'

      };

      var validate = function(err) {
        expect(err).to.equal(undefined);
        done();
      };
      validator.post(request, response, validate);

    });

    it('should return error for "2015-05-19 14:39:22+0600"', function(done) {

      request.body = {
        name: 'restaurantname',
        expires: '2015-05-19 14:39:22+0600'

      };

      var validate = function(err) {
        expect(err).to.be.an('object');
        done();
      };
      validator.post(request, response, validate);

    });

    it('should return error for date.now()', function(done) {

      request.body = {
        name: 'restaurantname',
        expires: moment()

      };

      var validate = function(err) {
        expect(err).to.be.an('object');
        done();
      };
      validator.post(request, response, validate);

    });

  });

});
