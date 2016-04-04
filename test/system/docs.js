/**
 * Tests are run from http_test.js
 */

var request = require('supertest');
var app;
var chai = require('chai');
chai.use(require('chai3-json-schema'));
chai.tv4.banUnknown = true;

module.exports = function(appInstance) {
  app = appInstance;
  describe('Testing documentation endpoints', function() {
    it('Should return API docs for GET /docs', function(done) {
      request(app)
        .get('/docs')
        .expect('Content-Type', /html/)
        .expect(200)
        .end(done);
    });
    it('Should return API docs for GET /goaldocs', function(done) {
      request(app)
        .get('/goaldocs')
        .expect('Content-Type', /html/)
        .expect(200)
        .end(done);
    });
  });
};
