var expect = require('chai').expect;
var validator = require('../../../app/validators/polls');

//Used to mock response and request objects for middleware testing
var httpMocks = require('node-mocks-http');

//For time-related tasks
var moment = require('moment');

//The modules below are needed to mock Knex
var mockDb = require('mock-knex');
var knex = require('knex');
var db = knex({
  client: 'pg',
});
mockDb.mock(db);

describe('Testing the poll validator (polls.js)', function() {
  var response;
  var request;

  //Create a mock response object that will be used in all tests.
  //This is done only once, since we dont actually test how this object is used.
  before(function() {
    response = httpMocks.createResponse();
  });

  //Create a mock request for each test case. Testcases will alter this object, and because of that
  //it has to be recreated before each test case to avoid them from altering each other
  beforeEach(function() {
    request = httpMocks.createRequest({
      method: 'POST',
      url: '/polls',
    });
  });

  describe('testing default values for non required parameters', function() {

    var defaultValues;

    //Create a request (not done by the earlier beforeEach since this inside another describe)
    //Set required body-parameter "name" and validate request in the validator to get defaultValues
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

    //One it-should for each parameter
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

    //Check that a valid value for name is accepted
    it('should pass for string', function(done) {

      request.body = {
        name: 'restaurantname'
      };

      var validate = function(err) {
        if (err) {
          console.log(err); //Log error so that if this fails, we can read that message
        }

        //the middleware we are testing will put validated parameters and default values
        //on request.validBody
        expect(request.validBody.name).to.equal('restaurantname');
        done();
      };
      validator.post(request, response, validate);

    });

    it('should return error for number', function(done) {
      request.body = {
        name: 123
      };

      //Error should be an object, since number is not allowed
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

      //err will be undefined if no error is thrown
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

    //date is before now. Cant have votes expire years before they begin
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

    //Cant have votes expire as they begin
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

  describe('for parameter "allowNewRestaurants"', function() {

    //Should it really? do we care?
    it('should pass for string "true"', function(done) {

      request.body = {
        name: 'restaurantname',
        allowNewRestaurants: 'true'
      };

      var validate = function(err) {
        expect(err).to.equal(undefined);
        done();
      };
      validator.post(request, response, validate);

    });


    it('should pass for boolean true', function(done) {

      request.body = {
        name: 'restaurantname', //name is required
        allowNewRestaurants: true
      };

      var validate = function(err) {
        expect(err).to.equal(undefined);
        done();
      };
      validator.post(request, response, validate);

    });

    it('should pass for boolean false', function(done) {

      request.body = {
        name: 'restaurantname', //name is required
        allowNewRestaurants: true
      };

      var validate = function(err) {
        expect(err).to.equal(undefined);
        done();
      };
      validator.post(request, response, validate);

    });

    it('should return error for 1', function(done) {

      request.body = {
        name: 'restaurantname',
        allowNewRestaurants: 1
      };

      var validate = function(err) {
        expect(err).to.be.an('object');
        done();
      };
      validator.post(request, response, validate);

    });

    it('should return error for string "1"', function(done) {

      request.body = {
        name: 'restaurantname',
        allowNewRestaurants: '1'
      };

      var validate = function(err) {
        expect(err).to.be.an('object');
        done();
      };
      validator.post(request, response, validate);

    });

    it('should return error for string "0"', function(done) {

      request.body = {
        name: 'restaurantname',
        allowNewRestaurants: '0'
      };

      var validate = function(err) {
        expect(err).to.be.an('object');
        done();
      };
      validator.post(request, response, validate);

    });

    it('should return error for object', function(done) {

      request.body = {
        name: 'restaurantname',
        allowNewRestaurants: {}
      };

      var validate = function(err) {
        expect(err).to.be.an('object');
        done();
      };
      validator.post(request, response, validate);

    });

    it('should return error for null', function(done) {

      request.body = {
        name: 'restaurantname',
        allowNewRestaurants: null
      };

      var validate = function(err) {
        expect(err).to.be.an('object');
        done();
      };
      validator.post(request, response, validate);

    });

  });

});
