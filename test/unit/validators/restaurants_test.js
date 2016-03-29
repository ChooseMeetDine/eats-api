var expect = require('chai').expect;
var validatorPath = '../../../app/validators/restaurants';
var proxyquire = require('proxyquire');
//Used to mock response and request objects for middleware testing
var httpMocks = require('node-mocks-http');
//The modules below are needed to mock Knex
var mockDb = require('mock-knex');
var knex = require('knex');
var db = knex({
  client: 'pg',
});

describe('Testing the restaurant validator (restaurants.js)', function() {

  describe('rules for coordinates for POST-requests', function() {
    var response;
    var request;
    var validatorWithMock;

    //Create a mock response object that will be used in all tests.
    //This is done only once, since we dont actually test how this object is used.
    before(function(done) {
      response = httpMocks.createResponse();
      mockDb.mock(db);
      validatorWithMock = proxyquire(validatorPath, {
        '../shared/database/knex': db
      });

      done();
    });

    //Create a mock request for each test case. Testcases will alter this object, because of that
    //it has to be recreated before each test case to avoid them from altering each other
    beforeEach(function() {
      request = httpMocks.createRequest({
        method: 'POST',
        url: '/restaurants',
      });
    });

    it('should return error for temporary:false without coordinates', function(done) {

      request.body = {
        name: 'restaurantname',
        temporary: false,
      };

      var validate = function(err) {
        expect(err).to.be.an('object');
        done();
      };
      validatorWithMock.post(request, response, validate);

    });

    it('should return for only name (temporary is false by default)', function(done) {

      request.body = {
        name: 'restaurantname',
      };

      var validate = function(err) {
        expect(err).to.be.an('object');
        done();
      };
      validatorWithMock.post(request, response, validate);

    });

    it('should return error for temporary:false with only lat', function(done) {

      request.body = {
        name: 'restaurantname',
        temporary: false,
        lat: 14.1414141414
      };

      var validate = function(err) {
        expect(err).to.be.an('object');
        done();
      };
      validatorWithMock.post(request, response, validate);

    });

    it('should return error for temporary:false with only lng', function(done) {

      request.body = {
        name: 'restaurantname',
        temporary: false,
        lng: 14.1414141414
      };

      var validate = function(err) {
        expect(err).to.be.an('object');
        done();
      };
      validatorWithMock.post(request, response, validate);
    });

    it('should return error for temporary:true with only lng', function(done) {

      request.body = {
        name: 'restaurantname',
        temporary: true,
        lng: 14.1414141414
      };

      var validate = function(err) {
        expect(err).to.be.an('object');
        done();
      };
      validatorWithMock.post(request, response, validate);
    });

    it('should return error for temporary:true with only lat', function(done) {

      request.body = {
        name: 'restaurantname',
        temporary: true,
        lat: 14.1414141414
      };

      var validate = function(err) {
        expect(err).to.be.an('object');
        done();
      };
      validatorWithMock.post(request, response, validate);
    });

    it('should not return error for temporary:true without coordinates', function(done) {

      request.body = {
        name: 'restaurantname',
        temporary: true
      };

      var validate = function(err) {
        expect(err).to.equal(undefined);
        done();
      };
      validatorWithMock.post(request, response, validate);
    });

    it('should not return error for temporary:false with coordinates', function(done) {

      request.body = {
        name: 'restaurantname',
        temporary: true,
        lat: 14.1414141414,
        lng: 14.1414141414
      };

      var validate = function(err) {
        expect(err).to.equal(undefined);
        done();
      };
      validatorWithMock.post(request, response, validate);
    });

    it('should  return error for coordinates out of bounds', function(done) {

      request.body = {
        name: 'restaurantname',
        temporary: true,
        lat: -214.1414141414,
        lng: 214.1414141414
      };

      var validate = function(err) {
        expect(err).to.be.an('object');
        done();
      };
      validatorWithMock.post(request, response, validate);
    });
  });

  describe('rules for coordinates for GET-requests', function() {
    var response;
    var request;
    var validatorWithMock;

    //Create a mock response object that will be used in all tests.
    //This is done only once, since we dont actually test how this object is used.
    before(function(done) {
      response = httpMocks.createResponse();
      mockDb.mock(db);
      validatorWithMock = proxyquire(validatorPath, {
        '../shared/database/knex': db
      });

      done();
    });

    //Create a mock request for each test case. Testcases will alter this object, because of that
    //it has to be recreated before each test case to avoid them from altering each other
    beforeEach(function() {
      request = httpMocks.createRequest({
        method: 'GET',
        url: '/restaurants',
      });
    });

    it('should return error for radius without coordinates', function(done) {

      request.query = {
        radius: 1000
      };

      var validate = function(err) {
        expect(err).to.be.an('object');
        done();
      };
      validatorWithMock.get(request, response, validate);

    });

    it('should return error for radius without lat', function(done) {

      request.query = {
        radius: 1000,
        lng: 12
      };

      var validate = function(err) {
        expect(err).to.be.an('object');
        done();
      };
      validatorWithMock.get(request, response, validate);

    });

    it('should return error for radius without lng', function(done) {

      request.query = {
        radius: 1000,
        lat: 12
      };

      var validate = function(err) {
        expect(err).to.be.an('object');
        done();
      };
      validatorWithMock.get(request, response, validate);

    });

    it('should return error for only lng', function(done) {

      request.query = {
        lng: 12
      };

      var validate = function(err) {
        expect(err).to.be.an('object');
        done();
      };
      validatorWithMock.get(request, response, validate);

    });

    it('should return error for only lat', function(done) {

      request.query = {
        lat: 12
      };

      var validate = function(err) {
        expect(err).to.be.an('object');
        done();
      };
      validatorWithMock.get(request, response, validate);

    });

    it('should not return error for coordinates without radius', function(done) {

      request.query = {
        lat: 12,
        lng: 42
      };

      var validate = function(err) {
        expect(err).to.equal(undefined);
        done();
      };
      validatorWithMock.get(request, response, validate);

    });

    it('should not return error without any parameters', function(done) {

      var validate = function(err) {
        expect(err).to.equal(undefined);
        done();
      };
      validatorWithMock.get(request, response, validate);

    });

    it('should not return error with all parameters', function(done) {

      request.query = {
        lat: 12,
        lng: 42,
        radius: 123
      };

      var validate = function(err) {
        expect(err).to.equal(undefined);
        done();
      };
      validatorWithMock.get(request, response, validate);

    });


  });
});
