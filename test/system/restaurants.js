var request = require('supertest');
var expect = require('chai').expect;
var chai = require('chai');
chai.use(require('chai3-json-schema'));

module.exports = function(appInstance) {
  app = appInstance;
  describe('Testing restaurants endpoint', function() {
    it('should return valid json data for GET /restaurants', function(done) {
      request(app)
        .get('/restaurants')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          var response = JSON.parse(res.text);
          expect(response).to.be.jsonSchema(jsonSchemaRestaurantGet);
          done();
        });
    });
  });
};


var jsonSchemaRestaurantGet = function() {
  return {
    // schema is built according to standard Shcema Draft4 by using http://jsonschema.net/#/
    // defined in API documentation json-format was translated to json-schema
    // extra id-s which were added by service are deleted, required attributes were defined
    '$schema': 'http://json-schema.org/draft-04/schema#',
    'type': 'object',
    'properties': {
      'links': {
        'id': 'links',
        'type': 'object',
        'properties': {
          'self': {
            'type': 'string'
          }
        },
        'required': [
          'self'
        ]
      },
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
                'info': {
                  'type': 'string'
                },
                'photo': {
                  'id': 'photo',
                  'type': 'string'
                },
                'priceRate': {
                  'type': 'integer'
                },
                'rating': {
                  'type': 'integer'
                },
                'numberVotes': {
                  'type': 'integer'
                },
                'numberWonVotes': {
                  'type': 'integer'
                },
                'longitude': {
                  'type': 'number'
                },
                'latitude': {
                  'type': 'number'
                },
                'temporary': {
                  'type': 'boolean'
                }
              },
              'required': ['name', 'info', 'longitude', 'latitude', 'numberVotes', 'numberWonVotes',
                'rating', 'priceRate', 'photo'
              ]
            },
            'relationships': {
              'type': 'object',
              'properties': {
                'category': {
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
                          }
                        }
                      }
                    }
                  }
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
          'required': ['type', 'id', 'attributes', 'relationships', 'links']
        }
      },
      'included': {
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
                }
              },
              'required': ['name']
            }
          },
          'required': ['type', 'id', 'attributes']
        }
      }
    },
    'required': [
      'links',
      'data',
      'included'
    ]
  };
};
