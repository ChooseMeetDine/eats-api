require('dotenv').config();
var request = require('supertest');
var rewire = require('rewire');
var app = rewire('../../app');
var expect = require('chai').expect;
var chai = require('chai');
chai.use(require('chai3-json-schema'));

var jsonSchemaPollGet = {
  // schema is built according to standard Shcema Draft4 by using http://jsonschema.net/#/
  // defined in API documentation json-format was translated to json-schema
  // extra id-s which were added by service are deleted, required attributes were defined
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
            'expires': {
              'type': 'string'
            },
            'created': {
              'type': 'string',
              'required': true
            },
            'allowNewRestaurants': {
              'type': 'boolean',
              'required': true
            }
          },
          'required': ['created', 'expires', 'allowNewRestaurants', 'name']
        }
      },
      'required': [
        'type',
        'id',
        'attributes'
      ]
    },
    'relationships': {
      'type': 'object',
      'properties': {
        'creator': {
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
                }
              },
              'required': ['type', 'id']
            }
          },
          'required': ['data']
        },
        'restaurants': {
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
        },
        'users': {
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
        },
        'group': {
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
                }
              }
            }
          }
        }
      },
      'required': ['users', 'group', 'restaurants', 'creator']
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
      'items': [{
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
              'latitude': {
                'type': 'number'
              },
              'longitude': {
                'type': 'number'
              },
              'temporary': {
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
        }
      }, {
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
                'type': 'string'
              },
              'anonymous': {
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
        }
      }, {
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
      }]
    }
  },
  'additionalProperties': false,
  'required': [
    'data',
    'relationships',
    'links',
    'included'
  ]
};
var jsonSchemaRestaurantGet = {
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
describe('Testing Eats-API HTTP requests', function() {
  describe('Testing endpoints', function() {
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
    it('should return valid json data for GET/polls', function(done) {
      request(app)
        .get('/polls')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          var response = JSON.parse(res.text);
          expect(response).to.be.jsonSchema(jsonSchemaPollGet);
          done();
        });
    });
    it('should return valid json data for GET/restaurants', function(done) {
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
    // it('POSTs a poll', function(done) {
    //   request(app)
    //     .post('/polls')
    //     .set('Content-Type', 'application/json')
    //     .send({})
    //     .end(function(err, res) {
    //       var response = JSON.parse(res.text);
    //       expect(response).to.deep.equal({
    //         authentication: false,
    //         message: 'You need to POST email and password',
    //         token: false
    //       });
    //       done();
    //     });
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
          //console.log(res.body);
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
    });


    /*  it('PUTs ....', function (done) {
        request(app).put('/../id').send({}).expect(200).end(done);
      });

      it('DELETEs ....', function (done) {
        request(app).delete('/../id').expect(200).end(done);
      });*/
  });
});
