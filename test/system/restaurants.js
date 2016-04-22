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

    describe.skip('with GET /restaurants', function() {
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

    describe.skip('Testing POST /restaurants', function() {
      it('should return valid JSON for POST /restaurants with user-token', function(done) {
        request(app)
          .post('/restaurants')
          .send({
            'name': 'Testaurant!!!',
            'categories': ['1'],
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
            'name': 'Testaurant!!',
            'categories': ['1'],
            'priceRate': 1,
            'rating': 2,
            'info': 'Not needed',
            'photo': 'www.not-a-real-photo.com',
            'temporary': false,
            'lng': 123.1,
            'lat': 123.1
          })
          .set('Content-Type', 'application/json')
          .expect(403)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            expect(res.body.message).to.equal('No token provided.');
            done(err);
          });
      });

      it('should return valid JSON for POST /restaurants with admin-token', function(done) {
        request(app)
          .post('/restaurants')
          .send({
            'name': 'Testaurant!!!!',
            'categories': ['1'],
            'priceRate': 3,
            'rating': 5,
            'info': 'Not needed',
            'photo': 'www.not-a-real-photo.com',
            'temporary': false,
            'lng': 123.1,
            'lat': 123.1
          })
          .set('Content-Type', 'application/json')
          .set('x-access-token', tokens.admin)
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            var response = res.body;
            expect(response).to.be.jsonSchema(jsonSchemaRestaurantPost());
            expect(response.data.attributes.status).to.equal('accepted');
            done(err);
          });
      });

      it('should return valid JSON for POST /restaurants with anonymous-token', function(done) {
        request(app)
          .post('/restaurants')
          .send({
            'name': 'Testaurant!',
            'categories': ['1'],
            'priceRate': 3,
            'rating': 5,
            'info': 'Not needed',
            'photo': 'www.not-a-real-photo.com',
            'temporary': false,
            'lng': 123.3,
            'lat': 123.3
          })
          .set('Content-Type', 'application/json')
          .set('x-access-token', tokens.anon)
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            var response = res.body;
            expect(response).to.be.jsonSchema(jsonSchemaRestaurantPost());
            done(err);
          });
      });
    });



    describe.skip('with PUT /restaurants/:id', function() {
      it('should return error when no token is used for PUT /restaurants/:id', function(done) {
        request(app)
          .put('/restaurants/1111')
          .expect(403, done);
      });

      it('should return error for PUT /restaurants with user-token', function(done) {
        request(app)
          .put('/restaurants/1111')
          .set('x-access-token', tokens.user)
          .expect(403, done);
      });

      it('should return error when restaurant doesnt exist in DB for PUT /restaurants',
        function(done) {
          request(app)
            .put('/restaurants/1000')
            .expect(404, done);
        });
      it('should return  error for invalid PUT /restaurants/:id with admin-token',
        function(done) {
          request(app)
            .put('/restaurants/1111')
            .send({
              'name': '!!!!!Testaurant',
              'categories': ['1113'],
              'priceRate': 1,
              'rating': 2,
              'info': 'Not needed',
              'photo': 'www.not-a-real-photo.com',
              'temporary': 123,
              'lng': 'aaa',
              'lat': 'bbb'
            })
            .set('Content-Type', 'application/json')
            .set('x-access-token', tokens.admin)
            .expect(400, done);
        });

      it('should return valid JSON for PUT /restaurants/:id with admin-token', function(done) {
        request(app)
          .put('/restaurants/1111')
          .send({
            'name': '!!!!!New name for Testaurant!!!!!',
            'categories': ['1113'],
            'priceRate': 3,
            'rating': 5,
            'info': 'Not needed',
            'photo': 'www.not-a-real-photo.com',
            'temporary': false,
            'lng': 123.1,
            'lat': 123.1
          })
          .set('Content-Type', 'application/json')
          .set('x-access-token', tokens.admin)
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            var response = res.body;
            expect(response).to.be.jsonSchema(jsonSchemaRestaurantPost());
            expect(response.data.attributes.name).to.equal('!!!!!New name for Testaurant!!!!!');
            done(err);
          });
      });
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
    'type': 'object',
    'properties': {
      'data': {
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
              'lat': {
                'type': 'number'
              },
              'info': {
                'type': 'string'
              },
              'photo': {
                'type': 'string'
              },
              'temporary': {
                'type': 'boolean'
              },
              'lng': {
                'type': 'number'
              },
              'priceRate': {
                'type': 'integer'
              },
              'status': {
                'type': 'string'
              },
              'rating': {
                'type': 'integer'
              },
              'numberOfPolls': {
                'type': 'integer'
              },
              'numberOfPollsWon': {
                'type': 'string'
              }
            },
            'required': ['name', 'rating', 'status', 'lng', 'lat', 'temporary', 'info',
              'numberOfPollsWon', 'numberOfPolls', 'priceRate', 'photo'
            ]
          },
          'relationships': {
            'type': 'object',
            'properties': {
              'categories': {
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
