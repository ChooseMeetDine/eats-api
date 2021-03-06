var expect = require('chai').expect;
var validator = require('../../../app/validators/polls');
var validatorPath = '../../../app/validators/polls';
var proxyquire = require('proxyquire');
//Used to mock response and request objects for middleware testing
var httpMocks = require('node-mocks-http');
//The modules below are needed to mock Knex
var mockDb = require('mock-knex');
var knex = require('knex');
var db = knex({
  client: 'pg',
});

//For time-related tasks
var moment = require('moment');

describe('Testing the validators for /polls', function() {
  describe('Testing the validator for POSTs to /polls (polls.js)', function() {
    var response;
    var request;

    //Create a mock response object that will be used in all tests.
    //This is done only once, since we dont actually test how this object is used.
    before(function() {
      response = httpMocks.createResponse();
    });

    //Create a mock request for each test case. Testcases will alter this object, and because of
    //that it has to be recreated before each test case to avoid them from altering each other
    beforeEach(function() {
      request = httpMocks.createRequest({
        method: 'POST',
        url: '/polls',
      });
    });

    describe('testing default values for non required parameters', function() {

      var defaultValues;

      //Create a request (not done by the earlier beforeEach since this inside another describe)
      //Set required body-parameter "name" and validate request in the validator to
      //get defaultValues
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

      it('should set users to an empty array', function() {
        expect(defaultValues.users).to.deep.equal([]);
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

    describe('for parameter "group"', function() {
      var validatorWithMock;
      var tracker;
      before(function(done) {
        mockDb.mock(db);
        validatorWithMock = proxyquire(validatorPath, {
          '../shared/database/knex': db
        });

        tracker = mockDb.getTracker();
        tracker.install();
        tracker.on('query', function checkResult(query) {
          query.response({
            rows: [{
              exists: true
            }]
          });
        });
        done();
      });

      it('should pass for "1"', function(done) {

        request.body = {
          name: 'restaurantname',
          group: '1'
        };

        var validate = function(err) {
          expect(err).to.equal(undefined);
          done();
        };
        validatorWithMock.post(request, response, validate);
      });

      it('should pass for "9007199254740991"', function(done) {

        request.body = {
          name: 'restaurantname',
          group: '9007199254740991'
        };

        var validate = function(err) {
          expect(err).to.equal(undefined);
          done();
        };
        validatorWithMock.post(request, response, validate);
      });

      it('should pass for "0"', function(done) {

        request.body = {
          name: 'restaurantname',
          group: '0'
        };

        var validate = function(err) {
          expect(err).to.equal(undefined);
          done();
        };
        validatorWithMock.post(request, response, validate);
      });

      it('should pass for null', function(done) {

        request.body = {
          name: 'restaurantname',
          group: null
        };

        var validate = function(err) {
          expect(err).to.equal(undefined);
          done();
        };
        validatorWithMock.post(request, response, validate);
      });

      it('should return error for true', function(done) {

        request.body = {
          name: 'restaurantname',
          group: true
        };

        var validate = function(err) {
          expect(err).to.be.an('object');
          done();
        };
        validatorWithMock.post(request, response, validate);

      });

      it('should return error for 123.2', function(done) {

        request.body = {
          name: 'restaurantname',
          group: 123.2
        };

        var validate = function(err) {
          expect(err).to.be.an('object');
          done();
        };
        validatorWithMock.post(request, response, validate);

      });

      it('should return error for -123', function(done) {

        request.body = {
          name: 'restaurantname',
          group: -123
        };

        var validate = function(err) {
          expect(err).to.be.an('object');
          done();
        };
        validatorWithMock.post(request, response, validate);

      });

      it('should return error for [123]', function(done) {

        request.body = {
          name: 'restaurantname',
          group: [123]
        };

        var validate = function(err) {
          expect(err).to.be.an('object');
          done();
        };
        validatorWithMock.post(request, response, validate);
      });

      it('should return error for {id:123}', function(done) {

        request.body = {
          name: 'restaurantname',
          group: {
            id: 123
          }
        };

        var validate = function(err) {
          expect(err).to.be.an('object');
          done();
        };
        validatorWithMock.post(request, response, validate);
      });
    });

    describe('for parameter "restaurants"', function() {
      var validatorWithMock;
      var tracker;

      before(function(done) {
        //Mock the database
        mockDb.mock(db);

        //Use the mocked database in the validator
        validatorWithMock = proxyquire(validatorPath, {
          '../shared/database/knex': db
        });

        //Install tracker
        tracker = mockDb.getTracker();
        tracker.install();
        done();
      });

      it('should pass for ["0"]', function(done) {

        //Tell tracker what to do when a query is sent to the database
        tracker.on('query', function(query) {
          query.response([{ //This wierd response structure is needed for the pluck-method
            id: '0'
          }]);
        });
        request.body = {
          name: 'restaurantname',
          restaurants: ['0']
        };

        var validate = function(err) {
          expect(err).to.equal(undefined);
          done();
        };
        //call the validator with the mocked db
        validatorWithMock.post(request, response, validate);
      });

      it('should pass for ["9007199254740991"]', function(done) {
        tracker.on('query', function(query) {
          query.response([{
            id: '9007199254740991'
          }]);
        });
        request.body = {
          name: 'restaurantname',
          restaurants: ['9007199254740991']
        };

        var validate = function(err) {
          expect(err).to.equal(undefined);
          done();
        };
        validatorWithMock.post(request, response, validate);
      });

      it('should return error for [true]', function(done) {
        request.body = {
          name: 'restaurantname',
          restaurants: [true]
        };

        var validate = function(err) {
          expect(err).to.be.an('object');
          done();
        };
        validatorWithMock.post(request, response, validate);

      });

      it('should return error for [123.2]', function(done) {
        request.body = {
          name: 'restaurantname',
          restaurants: [123.2]
        };

        var validate = function(err) {
          expect(err).to.be.an('object');
          done();
        };
        validatorWithMock.post(request, response, validate);

      });

      it('should return error for [-123.2]', function(done) {
        request.body = {
          name: 'restaurantname',
          restaurants: [-123.2]
        };

        var validate = function(err) {
          expect(err).to.be.an('object');
          done();
        };
        validatorWithMock.post(request, response, validate);

      });

      it('should return error for {id: -123.2}', function(done) {
        request.body = {
          name: 'restaurantname',
          restaurants: {
            id: -123.2
          }
        };

        var validate = function(err) {
          expect(err).to.be.an('object');
          done();
        };
        validatorWithMock.post(request, response, validate);

      });

      it('should return error for "string"', function(done) {
        request.body = {
          name: 'restaurantname',
          restaurants: 'string'
        };

        var validate = function(err) {
          expect(err).to.be.an('object');
          done();
        };
        validatorWithMock.post(request, response, validate);

      });

      it('should return error for 123', function(done) {
        request.body = {
          name: 'restaurantname',
          restaurants: 123
        };

        var validate = function(err) {
          expect(err).to.be.an('object');
          done();
        };
        validatorWithMock.post(request, response, validate);

      });

      it('should return error for null', function(done) {
        request.body = {
          name: 'restaurantname',
          restaurants: null
        };

        var validate = function(err) {
          expect(err).to.be.an('object');
          done();
        };
        validatorWithMock.post(request, response, validate);

      });
    });


    describe('for parameter "users"', function() {
      var validatorWithMock;
      var tracker;

      before(function(done) {
        //Mock the database
        mockDb.mock(db);

        //Use the mocked database in the validator
        validatorWithMock = proxyquire(validatorPath, {
          '../shared/database/knex': db
        });

        //Install tracker
        tracker = mockDb.getTracker();
        tracker.install();
        done();
      });

      it('should pass for ["9007199254740991"]', function(done) {
        tracker.on('query', function(query) {
          query.response([{
            id: '9007199254740991'
          }]);
        });
        request.body = {
          name: 'restaurantname',
          users: ['9007199254740991']
        };

        var validate = function(err) {
          expect(err).to.equal(undefined);
          done();
        };
        validatorWithMock.post(request, response, validate);
      });

      it('should return error for [true]', function(done) {
        request.body = {
          name: 'restaurantname',
          users: [true]
        };

        var validate = function(err) {
          expect(err).to.be.an('object');
          done();
        };
        validatorWithMock.post(request, response, validate);

      });

      it('should return error for [123.2]', function(done) {
        request.body = {
          name: 'restaurantname',
          users: [123.2]
        };

        var validate = function(err) {
          expect(err).to.be.an('object');
          done();
        };
        validatorWithMock.post(request, response, validate);

      });

      it('should return error for [-123.2]', function(done) {
        request.body = {
          name: 'restaurantname',
          users: [-123.2]
        };

        var validate = function(err) {
          expect(err).to.be.an('object');
          done();
        };
        validatorWithMock.post(request, response, validate);

      });

      it('should return error for {id: -123.2}', function(done) {
        request.body = {
          name: 'restaurantname',
          users: {
            id: -123.2
          }
        };

        var validate = function(err) {
          expect(err).to.be.an('object');
          done();
        };
        validatorWithMock.post(request, response, validate);

      });

      it('should return error for "string"', function(done) {
        request.body = {
          name: 'restaurantname',
          users: 'string'
        };

        var validate = function(err) {
          expect(err).to.be.an('object');
          done();
        };
        validatorWithMock.post(request, response, validate);

      });

      it('should return error for 123', function(done) {
        request.body = {
          name: 'restaurantname',
          users: 123
        };

        var validate = function(err) {
          expect(err).to.be.an('object');
          done();
        };
        validatorWithMock.post(request, response, validate);

      });

      it('should return error for null', function(done) {
        request.body = {
          name: 'restaurantname',
          users: null
        };

        var validate = function(err) {
          expect(err).to.be.an('object');
          done();
        };
        validatorWithMock.post(request, response, validate);

      });
    });
  });

  describe('Testing the validator for POSTs to /polls/:id/restaurants (polls.js)', function() {
    var response;
    var request;

    describe('for parameter "restaurantId"', function() {
      var validatorWithMock;
      var tracker;

      //Create a mock response object that will be used in all tests.
      //This is done only once, since we dont actually test how this object is used.
      before(function() {
        response = httpMocks.createResponse();
      });

      beforeEach(function(done) {
        //Create a mock request for each test case. Testcases will alter this object, and because of
        //that it has to be recreated before each test case to avoid them from altering each other
        request = httpMocks.createRequest({
          method: 'POST',
          url: '/polls/15/restaurants',
        });

        // Sets a valid poll ID
        request.validParams = {
          id: '15'
        };

        mockDb.mock(db);
        validatorWithMock = proxyquire(validatorPath, {
          '../shared/database/knex': db
        });

        tracker = mockDb.getTracker();
        tracker.install();
        done();
      });

      it('should pass for "9007199254740991"', function(done) {
        tracker.on('query', function gotQuery(query, step) {
          query.index = step;

          if (step === 1) {
            query.response([{ // 1st DB-query, NOT empty array = success
              id: '9007199254740991'
            }]);
          } else if (step === 2) { // 2nd DB-query, EMPTY array = success
            query.response([]);
          } else if (step === 3) { // 3rd DB-query
            query.response([{
              allowNewRestaurants: true
            }]);
          }
        });
        request.body = {
          restaurantId: '9007199254740991'
        };

        var validate = function(err) {
          expect(err).to.equal(undefined);
          done();
        };
        validatorWithMock.postRestaurant(request, response, validate);
      });

      it('should pass for "0"', function(done) {
        tracker.on('query', function gotQuery(query, step) {
          query.index = step;
          if (step === 1) {
            query.response([{ // 1st DB-query, NOT empty array = success
              id: '0'
            }]);
          } else if (step === 2) { // 2nd DB-query, EMPTY array = success
            query.response([]);
          } else if (step === 3) { // 3rd DB-query
            query.response([{
              allowNewRestaurants: true
            }]);
          }
        });
        request.body = {
          restaurantId: '0'
        };

        var validate = function(err) {
          expect(err).to.equal(undefined);
          done();
        };
        validatorWithMock.postRestaurant(request, response, validate);
      });

      it('should return error for null', function(done) {
        request.body = {
          restaurantId: null
        };

        var validate = function(err) {
          expect(err).to.be.an('object');
          done();
        };
        validatorWithMock.postRestaurant(request, response, validate);
      });

      it('should return error for empty id string', function(done) {
        request.body = {
          restaurantId: ''
        };

        var validate = function(err) {
          expect(err).to.be.an('object');
          done();
        };
        validatorWithMock.postRestaurant(request, response, validate);
      });

      it('should return error for true', function(done) {
        request.body = {
          restaurantId: true
        };

        var validate = function(err) {
          expect(err).to.be.an('object');
          done();
        };
        validatorWithMock.postRestaurant(request, response, validate);
      });

      it('should return error if DB returns no data in first query (ID not found)', function(done) {
        tracker.on('query', function gotQuery(query, step) {
          query.index = step;

          if (step === 1) {
            query.response([]); // 1st DB-query, NOT empty array = success
          } else if (step === 2) { // 2nd DB-query, EMPTY array = success
            query.response([]);
          }
        });
        request.body = {
          restaurantId: '0'
        };

        var validate = function(err) {
          expect(err).to.be.an('object');
          done();
        };
        validatorWithMock.postRestaurant(request, response, validate);
      });

      it('should return error if DB returns data in second query (ID already in poll)',
        function(done) {
          tracker.on('query', function gotQuery(query, step) {
            query.index = step;

            if (step === 1) {
              query.response([{ // 1st DB-query, NOT empty array = success
                some_data: 'some_data'
              }]);
            } else if (step === 2) { // 2nd DB-query, EMPTY array = success
              query.response([{
                some_data: 'some_data'
              }]);
            }
          });
          request.body = {
            restaurantId: '0'
          };

          var validate = function(err) {
            expect(err).to.be.an('object');
            done();
          };
          validatorWithMock.postRestaurant(request, response, validate);
        });
    });
  });

  describe('Testing the validator for POSTs to /polls/:id/votes (polls.js)', function() {
    var response;
    var request;
    var validatorWithMock;
    var tracker;

    describe('for parameter "restaurantId"', function() {
      before(function(done) {
        //Create a mock response object that will be used in all tests.
        //This is done only once, since we dont actually test how this object is used.
        response = httpMocks.createResponse();

        //Create a mock request for each test case. Testcases will alter this object, and because of
        //that it has to be recreated before each test case to avoid them from altering each other
        request = httpMocks.createRequest({
          method: 'POST',
          url: '/polls/15/votes',
        });

        // Sets a valid poll ID
        request.validParams = {
          id: '15'
        };

        mockDb.mock(db);
        validatorWithMock = proxyquire(validatorPath, {
          '../shared/database/knex': db
        });

        tracker = mockDb.getTracker();
        tracker.install();
        tracker.on('query', function gotQuery(query, step) {
          query.index = step;

          // Different responses from the "DB" depending on which test is being run
          // The validator has two DB-calls:
          // 1. checks if restaurant ID is valid
          // 2. checks if "expires" of the poll is after or before now
          // (even though the order of these two should be flipped..)
          //
          //For test no. 1, 2 and 3, let restaurant ID validation pass
          if (step === 1 || step === 3 || step === 5) {
            query.response([{
              some_data: 'some_data'
            }]);

            // For test no. 1, set expire date to before now to see if it generates an error
          } else if (step === 2) {
            query.response([{
              expires: '2000-01-01'
            }]);

            //For test no. 2, 3 and 4, let the expire validation pass
          } else if (step === 4 || step === 6 || step === 8) {
            query.response([{
              expires: '2222-01-01'
            }]);

            // For test no. 4, let restaurant ID validation fail
          } else {
            query.response([]);
          }
        });
        done();
      });


      it.skip('should return error if expires date is before now', function(done) {
        request.body = {
          restaurantId: '9007199254740991'
        };

        var validate = function(err) {
          expect(err).to.be.an('object');
          done();
        };
        validatorWithMock.postVote(request, response, validate);
      });

      it('should pass for ID "9007199254740991"', function(done) {
        request.body = {
          restaurantId: '9007199254740991'
        };

        var validate = function(err) {
          expect(err).to.equal(undefined);
          done();
        };
        validatorWithMock.postVote(request, response, validate);
      });

      it('should pass for ID "0"', function(done) {
        request.body = {
          restaurantId: '0'
        };

        var validate = function(err) {
          expect(err).to.equal(undefined);
          done();
        };
        validatorWithMock.postVote(request, response, validate);
      });

      it.skip('should return error if DB returns no data for query (ID not found)', function(done) {
        request.body = {
          restaurantId: '0'
        };

        var validate = function(err) {
          expect(err).to.be.an('object');
          done();
        };
        validatorWithMock.postVote(request, response, validate);
      });

      it('should return error for null', function(done) {
        request.body = {
          restaurantId: null
        };

        var validate = function(err) {
          expect(err).to.be.an('object');
          done();
        };
        validatorWithMock.postVote(request, response, validate);
      });

      it('should return error for empty id string', function(done) {
        request.body = {
          restaurantId: ''
        };

        var validate = function(err) {
          expect(err).to.be.an('object');
          done();
        };
        validatorWithMock.postVote(request, response, validate);
      });

      it('should return error for true', function(done) {
        request.body = {
          restaurantId: true
        };

        var validate = function(err) {
          expect(err).to.be.an('object');
          done();
        };
        validatorWithMock.postVote(request, response, validate);
      });
    });
  });
});
