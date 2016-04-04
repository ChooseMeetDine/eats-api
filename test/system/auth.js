var request = require('supertest');
var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai3-json-schema'));
chai.tv4.banUnknown = true;

module.exports = function(app, tokens) {
  describe('Testing auth endpoint', function() {
    it('Should return json response for POST /auth', function(done) {
      request(app)
        .post('/auth')
        .expect(200)
        .end(function(err, res) {
          var response = JSON.parse(res.text);
          expect(response).to.be.jsonSchema({
            'title': 'auth post schema',
            'type': 'object',
            'properties': {
              'authentication': {
                'type': 'boolean'
              },
              'message': {
                'type': 'string'
              },
              'token': {
                'type': 'boolean'
              }
            }
          });
          done();
        });
    });

    it('Should return valid data for POST /auth', function(done) {
      request(app)
        .post('/auth')
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
};
