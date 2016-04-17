/**
 * This is the file run by mocha for systemtests.
 * This file starts by creating tokens and the app-object,
 * these are then passed into the other test-files.
 */

require('dotenv').config();
var request = require('supertest');
var app = require('../../app');
var chai = require('chai');
chai.use(require('chai3-json-schema'));
chai.tv4.banUnknown = true;
var testPollsEndpoint = require('./polls');
var testDocsEndpoint = require('./docs');
var testRestaurantsEndpoint = require('./restaurants');
var testAuthEndpoint = require('./auth');
var testUsersEndpoint = require('./users');

//Create tokens needed for the system tests
var jwt = require('jsonwebtoken');
var cert = process.env.JWTSECRET;
var tokens = {};
tokens.admin = jwt.sign({
  email: 'kenny@mail.se',
  password: 'password123',
  anon: false,
  name: 'kenny',
  admin: true,
  id: 1140
}, cert, {
  expiresIn: '1m' // expires in 1 minute
});
tokens.user = jwt.sign({
  email: 'konny@mail.se',
  name: 'konny',
  admin: false,
  anon: false,
  password: 'password123',
  id: 1110
}, cert, {
  expiresIn: '1m' // expires in 1 minute
});
tokens.user2 = jwt.sign({
  email: 'peter@mail.se',
  password: 'password123',
  id: 1170
}, cert, {
  expiresIn: '1m' // expires in 1 minute
});
tokens.user3 = jwt.sign({
  email: 'mia@mail.se',
  password: 'password123',
  id: 1180
}, cert, {
  expiresIn: '1m' // expires in 1 minute
});
tokens.anon = jwt.sign({
  name: 'anon',
  admin: false,
  id: 1160
}, cert, {
  expiresIn: '1m' // expires in 1 minute
});


//Call tests for all endpoints
testDocsEndpoint(app);
testAuthEndpoint(app, tokens);
testPollsEndpoint(app, tokens);
testUsersEndpoint(app, tokens);
testRestaurantsEndpoint(app, tokens);

//Didn't think this needed it's own file
describe('Testing root endpoints', function() {
  it('Should load the root page for GET /', function(done) {
    request(app)
      .get('/')
      .expect(200)
      .expect('Content-Type', /html/)
      .end(done);
  });
});


/*
    it('POSTs a vote', function (done) {
      request('http://localhost:3001')
        .post('/vote')
        .send({})
        .expect(200)
        .end(done);
    });
});

it('POSTs a poll', function(done) {
  request(app)
    .post('/polls')
    .set('Content-Type', 'application/json')
    .send({})
    .end(function(err, res) {
      var response = JSON.parse(res.text);
      expect(response).to.deep.equal({
        authentication: false,
        message: 'You need to POST email and password',
        token: false
      });
      done();
    });

it('Should return valid data for POST /auth', function(done) {
  var port = process.env.PORT || 3001;
  console.log(port);
  request('http://localhost:' + port.toString())
    .post('/auth')
    .send({
      'email': 'musse@mail.se',
      'password': 'password123'
    })
    .expect(200)
    .end(function(err, res) {
      //console.log(res.body);
      var response = res.body;
      console.log(response);
      expect(response).to.be.jsonSchema({
        'title': 'auth valid schema',
        'type': 'object',
        'properties': {
          'authentication': {
            'type': 'boolean'
          },
          'message': {
            'type': 'string'
          },
          'token': {
            'type': 'string'
          }
        }
      });
      done();
    });
});

it('Should return json response with false authentication', function(done) {
  request(app)
    .post('/auth')
    .set('Content-Type', 'application/json')
    .end(function(err, res) {
      var response = JSON.parse(res.text);
      expect(response).to.deep.equal({
        authentication: false,
        message: 'You need to POST email and password',
        token: false
      });
      done();
    });
    //TODO: Implement this when branch systemtest_with_tokens is merged with develop
    it.skip('Should return valid data for POST /auth', function(done) {
      var port = process.env.PORT || 3001;
      request('http://localhost:' + port.toString())
        .post('/auth')
        .send({
          'email': 'musse@mail.se',
          'password': 'password123'
        })
        .expect(200)
        .end(function(err, response) {
          console.log(response.body);
          expect(response).to.be.jsonSchema({
            'title': 'auth valid schema',
            'type': 'object',
            'properties': {
              'authentication': {
                'type': 'boolean'
              },
              'message': {
                'type': 'string'
              },
              'token': {
                'type': 'string'
              }
            }
          });
          done();
        });
    });

  });
});
*/
