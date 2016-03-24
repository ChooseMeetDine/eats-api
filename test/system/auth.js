var request = require('supertest');
var app;
var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai3-json-schema'));

module.exports = function(appInstance) {
  app = appInstance;
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
          console.log(res);
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

  });
};
