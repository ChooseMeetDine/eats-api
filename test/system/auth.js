/**
 * Tests are run from http_test.js
 */

var request = require('supertest');
var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai3-json-schema'));
chai.tv4.banUnknown = true;

module.exports = function(app) {
  describe('Testing auth endpoint', function() {
    it('Should return error response for POST /auth without any body', function(done) {
      request(app)
        .post('/auth')
        .expect(400, done);
    });

    it('Should return valid data for POST /auth', function(done) {
      request(app)
        .post('/auth')
        .expect(200)
        .send({
          email: 'jenny@mail.se',
          password: 'password123'
        })
        .set('Content-Type', 'application/json')
        .end(function(err, res) {
          var response = res.body;
          expect(response).to.be.jsonSchema({
            'title': 'auth valid schema',
            'type': 'object',
            'properties': {
              'id': {
                'type': 'string'
              },
              'name': {
                'type': 'string'
              },
              'admin': {
                'type': 'boolean'
              },
              'anon': {
                'type': 'boolean'
              },
              'token': {
                'type': 'string'
              }
            }
          });
          done(err);
        });
    });

    it('Should return valid data for GET /auth/anonymous', function(done) {
      request(app)
        .get('/auth/anonymous')
        .expect(200)
        .set('Content-Type', 'application/json')
        .end(function(err, res) {
          var response = res.body;
          expect(response).to.be.jsonSchema({
            'title': 'auth valid schema',
            'type': 'object',
            'properties': {
              'id': {
                'type': 'string'
              },
              'name': {
                'type': 'string'
              },
              'anon': {
                'type': 'boolean'
              },
              'token': {
                'type': 'string'
              }
            }
          });
          done(err);
        });
    });

  });
};
