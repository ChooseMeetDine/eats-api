var request = require('supertest');
var rewire = require('rewire');
var app = rewire('../../app');

describe('Testing Eats-API HTTP requests', function () {
  describe('Testing endpoints', function () {

    beforeEach(function () {
      this.defs = [
        {
          term: 'One',
          defined: 'Term one defined'
        },
        {
          term: 'Two',
          defined: 'Term two defined'
        },
        {
          term: 'Three',
          defined: 'Term three defined'
        }
      ];

      app.__set__('skierTerms', this.defs);
    });

    it('should return valid json data', function (done) {
      var defs = this.defs;
      request(app)
        .get('/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          var terms = JSON.parse(res.text);
          expect(terms).to.deep.equal(defs);
          done();
        });
    });

    it('Should load the root page for GET /', function (done) {
      request(app)
        .get('/')
        .expect(200)
        .end(done);
    });

    it('Should return API docs for GET /docs', function (done) {
      request(app)
        .get('/docs')
        .expect('Content-Type', /html/)
        .expect(200)
        .end(done);
    });

    it('Should return API docs for GET /goaldocs', function (done) {
      request(app)
        .get('/goaldocs')
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
