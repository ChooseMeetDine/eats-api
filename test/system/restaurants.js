/**
 * Tests are run from http_test.js
 */

var request = require('supertest');
var expect = require('chai').expect;
var chai = require('chai');
chai.use(require('chai3-json-schema'));
chai.tv4.banUnknown = true;

module.exports = function(app, tokens) {
  describe('Testing restaurants endpoint', function() {

    describe('with GET /restaurants', function() {
      it('should return valid JSON for GET /restaurants with user-token', function(done) {
        request(app)
          .get('/restaurants')
          .set('x-access-token', tokens.user)
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            var response = res.body;
            expect(response).to.be.jsonSchema(jsonSchemaRestaurantGet());
            done(err);
          });
      });

      it('should return valid JSON for GET /restaurants with admin-token', function(done) {
        request(app)
          .get('/restaurants')
          .set('x-access-token', tokens.admin)
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            var response = res.body;
            expect(response).to.be.jsonSchema(jsonSchemaRestaurantGet());
            done(err);
          });
      });

      it('should return error when no token is used for GET /restaurants', function(done) {
        request(app)
          .get('/restaurants')
          .expect(403)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            expect(res.body.message).to.equal('No token provided.');
            done(err);
          });
      });

      it('should return error when a mock-token is used for GET /restaurants', function(done) {
        request(app)
          .get('/restaurants')
          .set('x-access-token', 'k1m23,m12.,3m1.2,3m1.,2m31,2m3.1,m23')
          .expect('Content-Type', /json/)
          .expect(403, done);
      });
    });

    describe('with POST /restaurants', function() {
      it('should return valid JSON for POST /restaurants with user-token', function(done) {
        request(app)
          .post('/restaurants')
          .send({
            'name': 'Testaurant',
            'categories': ['13'],
            'priceRate': 1,
            'rating': 2,
            'info': 'Not needed',
            'photo': 'www.not-a-real-photo.com',
            'temporary': false,
            'lng': 123.1,
            'lat': 123.1
          })
          .set('Content-Type', 'application/json')
          .set('x-access-token', tokens.user)
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            var response = res.body;
            expect(response).to.be.jsonSchema(jsonSchemaRestaurantPost());
            done(err);
          });
      });

      it('should return error for POST /restaurants without token', function(done) {
        request(app)
          .post('/restaurants')
          .send({
            name: 'Testaurant',
            temporary: false,
            info: 'Not needed',
            lng: 123.1,
            lat: 123.1,
            photo: 'www.not-a-real-photo.com',
            priceRate: 1,
            rating: 2,
            categories: ['13']
          })
          .set('Content-Type', 'application/json')
          .expect(403)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            expect(res.body.message).to.equal('No token provided.');
            done(err);
          });
      });

      //TODO: Test that restaurants get the status 'accepted' if admins add them

      //TODO: Test that restaurants can be added by anonymous users

    });


  });
};

// schema is built according to standard Shcema Draft4 by using http://jsonschema.net/#/
// defined in API documentation json-format was translated to json-schema
// extra id-s which were added by service are deleted, required attributes were defined
var jsonSchemaRestaurantGet = function() {
  return {
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
                  'type': ['string', 'null']
                },
                'photo': {
                  'id': 'photo',
                  'type': ['string', 'null']
                },
                'priceRate': {
                  'type': ['integer', 'null']
                },
                'rating': {
                  'type': ['integer', 'null']
                },
                'numberVotes': {
                  'type': 'integer'
                },
                'numberWonVotes': {
                  'type': 'integer'
                },
                'lng': {
                  'type': ['number', 'null']
                },
                'lat': {
                  'type': ['number', 'null']
                },
                'temporary': {
                  'type': 'boolean'
                },
                'status': {
                  'type': 'string'
                }
              },
              'required': ['name', 'info', 'lng', 'lat',
                'rating', 'priceRate', 'photo'
              ]
            },
            'relationships': {
              'type': 'object',
              'properties': {
                'categories': {
                  'type': 'array',
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
          'required': ['type', 'id', 'attributes', 'links']
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

var jsonSchemaRestaurantPost = function() {
  return {
    '$schema': 'http://json-schema.org/draft-04/schema#',
    'id': 'http://jsonschema.net',
    'type': 'object',
    'properties': {
      'data': {
        'id': 'http://jsonschema.net/data',
        'type': 'object',
        'properties': {
          'type': {
            'id': 'http://jsonschema.net/data/type',
            'type': 'string'
          },
          'id': {
            'id': 'http://jsonschema.net/data/id',
            'type': 'string'
          },
          'attributes': {
            'id': 'http://jsonschema.net/data/attributes',
            'type': 'object',
            'properties': {
              'name': {
                'id': 'http://jsonschema.net/data/attributes/name',
                'type': 'string'
              },
              'lat': {
                'id': 'http://jsonschema.net/data/attributes/lat',
                'type': 'number'
              },
              'info': {
                'id': 'http://jsonschema.net/data/attributes/info',
                'type': 'string'
              },
              'photo': {
                'id': 'http://jsonschema.net/data/attributes/photo',
                'type': 'string'
              },
              'temporary': {
                'id': 'http://jsonschema.net/data/attributes/temporary',
                'type': 'boolean'
              },
              'lng': {
                'id': 'http://jsonschema.net/data/attributes/lng',
                'type': 'number'
              },
              'priceRate': {
                'id': 'http://jsonschema.net/data/attributes/priceRate',
                'type': 'integer'
              },
              'status': {
                'id': 'http://jsonschema.net/data/attributes/status',
                'type': 'string'
              },
              'rating': {
                'id': 'http://jsonschema.net/data/attributes/rating',
                'type': 'integer'
              },
              'numberOfPolls': {
                'id': 'http://jsonschema.net/data/attributes/numberOfPolls',
                'type': 'integer'
              },
              'numberOfPollsWon': {
                'id': 'http://jsonschema.net/data/attributes/numberOfPollsWon',
                'type': 'string'
              }
            },
            'required': ['name', 'rating', 'status', 'lng', 'lat', 'temporary', 'info',
              'numberOfPollsWon', 'numberOfPolls', 'priceRate', 'photo'
            ]
          },
          'relationships': {
            'id': 'http://jsonschema.net/data/relationships',
            'type': 'object',
            'properties': {
              'categories': {
                'id': 'http://jsonschema.net/data/relationships/categories',
                'type': 'object',
                'properties': {
                  'data': {
                    'id': 'http://jsonschema.net/data/relationships/categories/data',
                    'type': 'array',
                    'items': {
                      'id': 'http://jsonschema.net/data/relationships/categories/data/0',
                      'type': 'object',
                      'properties': {
                        'type': {
                          'id': 'http://jsonschema.net/data/relationships/categories/data/0/type',
                          'type': 'string'
                        },
                        'id': {
                          'id': 'http://jsonschema.net/data/relationships/categories/data/0/id',
                          'type': 'string'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        'required': [
          'type',
          'id',
          'attributes',
          'relationships'
        ]
      },
      'links': {
        'type': 'object',
        'properties': {
          'self': {
            'type': 'string'
          }
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
          }
        }
      }
    },
    'required': [
      'data',
      'links',
      'included'
    ]
  };
};
