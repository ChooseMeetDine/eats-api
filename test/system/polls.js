var request = require('supertest');
var expect = require('chai').expect;
var chai = require('chai');
chai.use(require('chai3-json-schema'));

module.exports = function(appInstance, tokensObject) {
  var app = appInstance;
  var tokens = tokensObject;
  describe.skip('Testing polls endpoint', function() {
    it('should return valid json data for GET /polls', function(done) {
      request(app)
        .get('/polls')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          var response = JSON.parse(res.text);
          expect(response).to.be.jsonSchema(jsonSchemaPollGet());
          done();
        });
    });
  });
};


// schema is built according to standard Shcema Draft4 by using http://jsonschema.net/#/
// defined in API documentation json-format was translated to json-schema
// extra id-s which were added by service are deleted, required attributes were defined
var jsonSchemaPollGet = function() {
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
};
