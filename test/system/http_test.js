require('dotenv').config();
var request = require('supertest');
var rewire = require('rewire');
var app = rewire('../../app');
var chai = require('chai');
chai.use(require('chai3-json-schema'));
var testPollsEndpoint = require('./polls');
var testDocsEndpoint = require('./docs');
var testRestaurantsEndpoint = require('./restaurants');
var testAuthEndpoint = require('./auth');

testPollsEndpoint(app);
testRestaurantsEndpoint(app);
testDocsEndpoint(app);
testAuthEndpoint(app);

describe('Testing root endpoints', function() {
  it('Should load the root page for GET /', function(done) {
    request(app)
      .get('/')
      .expect(200)
      .expect('Content-Type', /html/)
      .end(done);
  });
});



describe.skip('Testing Eats-API HTTP requests', function() {



  /*
      it('POSTs a vote', function (done) {
        request('http://localhost:3001')
          .post('/vote')
          .send({})
          .expect(200)
          .end(done);
      });
  });
  // it('POSTs a poll', function(done) {
  //   request(app)
  //     .post('/polls')
  //     .set('Content-Type', 'application/json')
  //     .send({})
  //     .end(function(err, res) {
  //       var response = JSON.parse(res.text);
  //       expect(response).to.deep.equal({
  //         authentication: false,
  //         message: 'You need to POST email and password',
  //         token: false
  //       });
  //       done();
  //     });
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
  });


  /*  it('PUTs ....', function (done) {
      request(app).put('/../id').send({}).expect(200).end(done);
    });

    it('DELETEs ....', function (done) {
      request(app).delete('/../id').expect(200).end(done);
    });*/
});
