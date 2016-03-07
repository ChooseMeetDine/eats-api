require('dotenv').config({
  path: '../../../.env'
});

// Standard chai
var chai = require('chai');
var expect = chai.expect;

//Chai for promises
var chaiAsPromised = require('chai-as-promised');
chai.should();
chai.use(chaiAsPromised);

//Other
var pollsDatahandler = require('../../../app/datahandlers/polls');
// var proxyquire = require('proxyquire');
//Used to mock response and request objects for middleware testing
var httpMocks = require('node-mocks-http');

// require('dotenv').config({
//   path: '../../../.env'
// });

//The modules below are needed to mock Knex
// var mockDb = require('mock-knex');
// var knex = require('knex');
//
// var db = knex({
//   client: 'pg',
// });

// var moment = require('moment');

describe('Testing the datahandler for polls (datahandlers/polls.js)', function() {
  var response;
  var request;

  //Create a mock response object that will be used in all tests.
  //This is done only once, since we dont actually test how this object is used.
  before(function() {
    response = httpMocks.createResponse();
  });

  //Create a mock request for each test case. Testcases will alter this object, and because of that
  //it has to be recreated before each test case to avoid them from altering each other
  // beforeEach(function() {
  //   request = httpMocks.createRequest({
  //     method: 'POST',
  //     url: '/polls',
  //     body: 'test'
  //   });
  // });

  describe('testing default values for non required parameters', function() {
    //Create a request (not done by the earlier beforeEach since this inside another describe)
    //Set required body-parameter "name" and validate request in the validator to get defaultValues
    before(function() {
      request = httpMocks.createRequest({
        method: 'POST',
        url: '/polls',
      });
      request.validUser = 10;
      request.validBody = {
        name: 'Omröstning från testerna 999',
        users: [10, 20, 30999],
        restaurants: [11, 21, 31],
        allowNewRestaurants: true,
        expires: '2016-03-06T06:36:09Z',
        group: 14
      };
      // var validate = function(err) {
      //   if (err) {
      //     console.log(err);
      //   }
      //   defaultValues = request.validBody;
      //   done();
      // };
      //
      // validator.post(request, response, validate);
    });

    //One it-should for each parameter
    it('should resolve if everything is correct', function() {
      return pollsDatahandler.post(request)
        .should.eventually.be.fulfilled;


      // return pollsDatahandler.post(request).then(function(result) {
      //     console.log('RESULT: ' + result);
      //   })
      //   .catch(function(error) {
      //     console.log('ERROR: ' + error);
      //   })
      //   .should.eventually.be.fulfilled;

      // return pollsDatahandler.post(request).then(function(result) {
      //     console.log('RESULT: ' + result);
      //   })
      //   .catch(function(error) {
      //     console.log('ERROR: ' + error);
      //   });
    });
  });
});
