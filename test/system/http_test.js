var request = require('supertest');
var rewire = require('rewire');
var app = rewire('../../app');
var expect = require('chai').expect;
var chai = require('chai');
chai.use(require('chai3-json-schema'));

var jsonSchema = {
  'title': 'user schema',
  'type': 'object',
  'properties': {
    'name': {
      'type': 'string'
    },
    'age': {
      'type': 'number',
      'minimum': 5
    }
  }
};

describe('Testing Eats-API HTTP requests', function() {
  describe('Testing endpoints', function() {
    it('should return valid json data', function(done) {
      request(app)
        .get('/users')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          var response = JSON.parse(res.text);
          expect(response).to.be.jsonSchema(jsonSchema);
          done();
        });
    });

    /*
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
    });*/

    it('Should load the root page for GET /', function(done) {
      request(app)
        .get('/')
        .expect(200)
        .expect('Content-Type', /html/)
        .end(done);
    });

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
