var request = require('supertest');
var rewire = require('rewire');
var app = rewire('../../app');

describe('Testing Eats-API HTTP requests', function() {
  describe('Testing endpoints', function() {

    it('Should load the root page for GET /', function(done) {
      request(app)
        .get('/')
        .expect(200)
        .end(done);
    });

    it('Should return API docs for GET /docs', function(done) {
      request(app)
        .get('/docs')
        .expect('Content-Type', /html/)
        .expect(200)
        .end(done);
    });
    /*
        it('POSTs a vote', function (done) {
          request('http://localhost:3001')
            .post('/vote')
            .send({})
            .expect(200)
            .end(done);
        });

        it('PUTs ....', function (done) {
          request(app).put('/../id').send({}).expect(200).end(done);
        });

        it('DELETEs ....', function (done) {
          request(app).delete('/../id').expect(200).end(done);
        });*/
  });
});
