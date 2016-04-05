/**
 * Tests are run from http_test.js
 */

var request = require('supertest');
var expect = require('chai').expect;
var chai = require('chai');
chai.use(require('chai3-json-schema'));
chai.tv4.banUnknown = true;

module.exports = function(app, tokens) {
  describe('Testing Users endpoint', function() {

    describe('with POST /users', function() {

      it('should return valid JSON for POST /users without token and all params', function(done) {
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

    describe('with Get /users', function() {

      it('should return valid JSON for GET /users with user token', function(done) {
        request(app)
          .get('/users')
          .set('Content-Type', 'application/json')
          .set('x-access-token', tokens.user)
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            var response = res.body;
            expect(response).to.be.jsonSchema(jsonSchemaGetUsersAsUser());
            done(err);
          });
      });

      it('should return valid JSON for GET /users with anon token', function(done) {
        request(app)
          .get('/users')
          .set('Content-Type', 'application/json')
          .set('x-access-token', tokens.anon)
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            var response = res.body;
            expect(response).to.be.jsonSchema(jsonSchemaGetUsersAsUser());
            done(err);
          });
      });

      it('should return valid JSON for GET /users with admin token', function(done) {
        request(app)
          .get('/users')
          .set('Content-Type', 'application/json')
          .set('x-access-token', tokens.admin)
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            var response = res.body;
            expect(response).to.be.jsonSchema(jsonSchemaGetUsersAsAdmin());
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

// schema is built according to standard Schema Draft4 by using http://jsonschema.net/#/
var jsonSchemaGetUsersAsAdmin = function() {
  return {
    'type': 'object',
    'properties': {
      'data': {
        'type': 'array',
        'items': {
          'type': 'object',
          'properties': {
            'type': {
              'type': 'string'
            },
            'id': {
              'type': 'string'
            },
            'attributes': {
              'type': 'object',
              'properties': {
                'name': {
                  'type': 'string'
                },
                'photo': {
                  'type': ['null', 'string']
                },
                'email': {
                  'type': ['null', 'string']
                },
                'phone': {
                  'type': ['null', 'string']
                },
                'admin': {
                  'type': 'boolean'
                },
                'anon': {
                  'type': 'boolean'
                }
              }
            },
            'links': {
              'type': 'object',
              'properties': {
                'self': {
                  'type': 'string'
                }
              }
            }
          },
          'required': [
            'type',
            'attributes',
            'links'
          ]
        }
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

// schema is built according to standard Schema Draft4 by using http://jsonschema.net/#/
var jsonSchemaGetUsersAsUser = function() {
  return {
    'type': 'object',
    'properties': {
      'data': {
        'type': 'array',
        'items': {
          'type': 'object',
          'properties': {
            'type': {
              'type': 'string'
            },
            'id': {
              'type': 'string'
            },
            'attributes': {
              'type': 'object',
              'properties': {
                'name': {
                  'type': 'string'
                },
                'photo': {
                  'type': ['null', 'string']
                }
              }
            },
            'links': {
              'type': 'object',
              'properties': {
                'self': {
                  'type': 'string'
                }
              }
            }
          },
          'required': [
            'type',
            'attributes',
            'links'
          ]
        }
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
