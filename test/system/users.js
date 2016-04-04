/**
 * Tests are run from http_test.js
 */

var request = require('supertest');
var expect = require('chai').expect;
var chai = require('chai');
chai.use(require('chai3-json-schema'));
chai.tv4.banUnknown = true;

module.exports = function(app) {
  describe('Testing Users endpoint', function() {
    describe('with POST /users', function() {

      it('should return valid JSON for POST /users without any token', function(done) {
        request(app)
          .post('/users')
          .send({
            'name': 'askmdlakmsdklamslkdmlaksm klamsdlaksmdlka msm  - TESTUSER',
            'password': 'Qwerty1',
            'email': 'ballebskrutt@eats.se',
            'phone': '076123123',
            'photo': 'http://photo.com/1234.jpg'
          })
          .set('Content-Type', 'application/json')
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            var response = res.body;
            expect(response).to.be.jsonSchema(jsonSchemaPostUser());
            done(err);
          });
      });

      it('should return valid JSON for POST /users with only name, password and email',
        function(done) {
          request(app)
            .post('/users')
            .send({
              'name': 'askmdlakmsdklamslkdmlaksm klamsdlaksmdlka msm  - TESTUSER',
              'password': 'Qwerty1',
              'email': 'ballebskrutt2@eats.se'
            })
            .set('Content-Type', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
              var response = res.body;
              expect(response).to.be.jsonSchema(jsonSchemaPostUser());
              done(err);
            });
        });
    });
  });
};


// schema is built according to standard Schema Draft4 by using http://jsonschema.net/#/
var jsonSchemaPostUser = function() {
  return {
    'type': 'object',
    'properties': {
      'data': {
        'id': 'data',
        'type': 'object',
        'properties': {
          'type': {
            'id': 'type',
            'type': 'string'
          },
          'id': {
            'id': 'id',
            'type': 'string'
          },
          'attributes': {
            'id': 'attributes',
            'type': 'object',
            'properties': {
              'name': {
                'id': 'name',
                'type': 'string'
              },
              'email': {
                'id': 'email',
                'type': 'string'
              },
              'phone': {
                'id': 'phone',
                'type': ['string', 'null']
              },
              'photo': {
                'id': 'photo',
                'type': ['string', 'null']
              },
              'admin': {
                'id': 'admin',
                'type': 'boolean'
              },
              'anon': {
                'id': 'anon',
                'type': 'boolean'
              }
            }
          }
        },
        'required': [
          'type',
          'id',
          'attributes'
        ]
      },
      'links': {
        'id': 'links',
        'type': 'object',
        'properties': {
          'self': {
            'id': 'self',
            'type': 'string'
          }
        }
      }
    },
    'required': [
      'data',
      'links'
    ]
  };
};
