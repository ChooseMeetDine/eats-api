/**
 * Tests are run from http_test.js
 */

var request = require('supertest');
var expect = require('chai').expect;
var chai = require('chai');
chai.use(require('chai3-json-schema'));
chai.tv4.banUnknown = true;

module.exports = function(app, tokens) {
  describe('Testing polls endpoint', function() {
    describe('Testing POST /polls/:id/votes', function() {
      // valid poll: 1135
      // valid user: 1180 / mia / user3
      // valid restaurant: 1121

      it('should return error when no token is used', function(done) {
        request(app)
          .post('/polls/1135/votes')
          .send({})
          .expect(403, done);
      });
      it('should return error when an invalid poll ID is used', function(done) {
        request(app)
          .post('/polls/9999/votes')
          .send({})
          .set('x-access-token', tokens.user3)
          .expect(404, done);
      });
      it('should return error when the user is not a participant in the poll', function(done) {
        request(app)
          .post('/polls/1135/votes')
          .send({})
          .set('x-access-token', tokens.user2)
          .expect(403, done);
      });
      it('should return error if poll has expired', function(done) {
        request(app)
          .post('/polls/1115/votes')
          .send({})
          .set('x-access-token', tokens.user3)
          .expect(400, done);
      });
      it('should return error if the user has already voted in the poll', function(done) {
        request(app)
          .post('/polls/1135/votes')
          .send({})
          .set('x-access-token', tokens.user)
          .expect(403, done);
      });
      it('should return error when the restaurant is not added to the poll', function(done) {
        request(app)
          .post('/polls/1135/votes')
          .send({
            restaurantId: '1151'
          })
          .set('x-access-token', tokens.user3)
          .expect(400, done);
      });
      it('should return error if the POST-body is invalid', function(done) {
        request(app)
          .post('/polls/1135/votes')
          .send({
            name: 'adsfasdf'
          })
          .set('x-access-token', tokens.user3)
          .expect(400, done);
      });

      // TODO: Fixa gör ett nästlat GET-anrop mot /polls/:id för poll ID 1135 och kontrollera
      // att voten verkligen är tillagd
      // Exempelkod:
      //
      // request(app)
      // .post()....
      // .end(function(err, res){
      //  expect(res.data.type).to.equal('vote');
      //  var id = res.data.id;
      //  request(app)
      //  .get(/polls/:id)....
      //  .end(function(err, res){
      //    expect(schema)
      //    var votes = []
      //    for (let i = 0; i < res.data.relationships.votes.length; i++) {
      //      votes.push(res.data.relationships.votes[i].id)
      //    }
      //    expect(votes.indexOf(id)).to.not.equal(-1);
      //
      // });
      it('should return valid json for valid POST', function(done) {
        request(app)
          .post('/polls/1135/votes')
          .send({
            restaurantId: '1121'
          })
          .set('x-access-token', tokens.user3)
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            expect(res.body).to.be.jsonSchema(jsonSchemaPollIdVotePost());
            done(err);
          });
      });
    });
    describe('Testing POST /polls/:id/restaurants', function() {
      it('should return error when no token is used', function(done) {
        request(app)
          .post('/polls/1135/restaurants')
          .send({})
          .expect(403, done);
      });
      it('should return error when an invalid poll ID is used', function(done) {
        request(app)
          .post('/polls/9999/restaurants')
          .send({})
          .set('x-access-token', tokens.user3)
          .expect(404, done);
      });
      it('should return error when the user is not a participant in the poll', function(done) {
        request(app)
          .post('/polls/1135/restaurants')
          .send({})
          .set('x-access-token', tokens.user2)
          .expect(403, done);
      });
      it('should return error if poll has expired', function(done) {
        request(app)
          .post('/polls/1115/restaurants')
          .send({})
          .set('x-access-token', tokens.user3)
          .expect(400, done);
      });
      it('should return error if the POST-body is invalid', function(done) {
        request(app)
          .post('/polls/1135/restaurants')
          .send({
            name: 'adsfasdf'
          })
          .set('x-access-token', tokens.user3)
          .expect(400, done);
      });
      it('should return error if the restaurant is already added to the poll', function(done) {
        request(app)
          .post('/polls/1135/restaurants')
          .send({
            restaurantId: '1121'
          })
          .set('x-access-token', tokens.user3)
          .expect(400, done);
      });
      it('should return error if the poll doesnt allow new restaurants', function(done) {
        request(app)
          .post('/polls/1115/restaurants')
          .send({
            restaurantId: '1151'
          })
          .set('x-access-token', tokens.user3)
          .expect(400, done);
      });

      // TODO: Fixa gör ett nästlat GET-anrop mot /polls/:id för poll ID 1135 och kontrollera
      // att restauranten verkligen är tillagd
      // Exempelkod:
      //
      // request(app)
      // .post()....
      // .end(function(err, res){
      //  expect(res.data.type).to.equal('restaurant');
      //  var id = res.data.id;
      //  request(app)
      //  .get(/polls/:id)....
      //  .end(function(err, res){
      //    expect(schema)
      //    var votes = []
      //    for (let i = 0; i < res.data.relationships.restaurants.length; i++) {
      //      votes.push(res.data.relationships.restaurants[i].id)
      //    }
      //    expect(restaurants.indexOf(id)).to.not.equal(-1);
      //
      // });
      it('should return valid json for valid POST', function(done) {
        request(app)
          .post('/polls/1135/restaurants')
          .send({
            restaurantId: '1151'
          })
          .set('x-access-token', tokens.user3)
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            expect(res.body).to.be.jsonSchema(jsonSchemaPollIdRestaurantsPost());
            done(err);
          });
      });
    });
    describe('Testing POST /polls/:id/users', function() {
      it('should return error when no token is used', function(done) {
        request(app)
          .post('/polls/1135/users')
          .send({})
          .expect(403, done);
      });
      it('should return error when an invalid poll ID is used', function(done) {
        request(app)
          .post('/polls/9999/users')
          .send({})
          .set('x-access-token', tokens.user2)
          .expect(404, done);
      });
      it('should return error if poll has expired', function(done) {
        request(app)
          .post('/polls/1115/users')
          .send({})
          .set('x-access-token', tokens.user2)
          .expect(400, done);
      });
      it('should return error if the POST-body is invalid (not empty)', function(done) {
        request(app)
          .post('/polls/1135/users')
          .send({
            name: 'adsfasdf'
          })
          .set('x-access-token', tokens.user2)
          .expect(400, done);
      });
      it('should return error if the user has already been added to the poll', function(done) {
        request(app)
          .post('/polls/1135/users')
          .send()
          .set('x-access-token', tokens.user3)
          .expect(400, done);
      });
      // TODO: Fixa gör ett nästlat GET-anrop mot /polls/:id för poll ID 1135 och kontrollera
      // att användaren verkligen är tillagd
      // Exempelkod:
      //
      // request(app)
      // .post()....
      // .end(function(err, res){
      //  expect(res.data.type).to.equal('restaurant');
      //  var id = res.data.id;
      //  request(app)
      //  .get(/polls/:id)....
      //  .end(function(err, res){
      //    expect(schema)
      //    var votes = []
      //    for (let i = 0; i < res.data.relationships.restaurants.length; i++) {
      //      votes.push(res.data.relationships.restaurants[i].id)
      //    }
      //    expect(restaurants.indexOf(id)).to.not.equal(-1);
      //
      // });
      it('should return valid json for valid POST', function(done) {
        request(app)
          .post('/polls/1135/users')
          .send()
          .set('x-access-token', tokens.user2)
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            expect(res.body).to.be.jsonSchema(jsonSchemaPollIdUsersPost());
            done(err);
          });
      });
    });
  });

  describe('Testing POST /polls', function() {
    it('should return valid JSON for POST /polls with user-token', function(done) {
      request(app)
        .post('/polls')
        .send({
          'name': '!!!Name of the poll',
          'expires': '2017-08-07T10:46:40+00:00',
          'restaurants': [
            '148347983094076'
          ],
          'allowNewRestaurants': true
        })
        .set('Content-Type', 'application/json')
        .set('x-access-token', tokens.user)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          var response = res.body;
          expect(response).to.be.jsonSchema(jsonSchemaPollPost());
          done(err);
        });
    });

    it('should return error for POST /polls without token', function(done) {
      request(app)
        .post('/polls')
        .send({
          'name': '!!!Name of the poll',
          'expires': '2017-08-07T10:46:40+00:00',
          'restaurants': [
            '148347983094076'
          ],
          'allowNewRestaurants': true
        })
        .set('Content-Type', 'application/json')
        .expect(403, done);
    });

    it('should return valid JSON for POST /polls with admin-token', function(done) {
      request(app)
        .post('/polls')
        .send({
          'name': '!!!Name of the poll',
          'expires': '2017-08-07T10:46:40+00:00',
          'restaurants': [
            '148347983094076'
          ],
          'allowNewRestaurants': true
        })
        .set('Content-Type', 'application/json')
        .set('x-access-token', tokens.admin)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          var response = res.body;
          expect(response).to.be.jsonSchema(jsonSchemaPollPost());
          done(err);
        });
    });

    it('should returnvalid json answer for POST /polls with anonymous-token', function(done) {
      request(app)
        .post('/polls')
        .send({
          'name': '!!!Name of the poll',
          'expires': '2017-08-07T10:46:40+00:00',
          'restaurants': [
            '148347983094076'
          ],
          'allowNewRestaurants': true
        })
        .set('Content-Type', 'application/json')
        .set('x-access-token', tokens.anon)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          var response = res.body;
          expect(response).to.be.jsonSchema(jsonSchemaPollPost());
          done(err);
        });
    });
  });

  describe('Testing GET /polls', function() {
    it('should return valid JSON for GET /polls with user-token', function(done) {
      request(app)
        .get('/polls')
        .set('Content-Type', 'application/json')
        .set('x-access-token', tokens.user)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          var response = res.body;
          expect(response).to.be.jsonSchema(jsonSchemaPollGet());
          done(err);
        });
    });

    it('should return error for GET /polls without token', function(done) {
      request(app)
        .get('/polls')
        .set('Content-Type', 'application/json')
        .expect(403, done);
    });

    it('should return valid JSON for GET /polls with admin-token', function(done) {
      request(app)
        .get('/polls')
        .set('Content-Type', 'application/json')
        .set('x-access-token', tokens.admin)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          var response = res.body;
          expect(response).to.be.jsonSchema(jsonSchemaPollGet());
          done(err);
        });
    });

    it('should returnvalid json answer for GET /polls with anonymous-token', function(done) {
      request(app)
        .get('/polls')
        .set('Content-Type', 'application/json')
        .set('x-access-token', tokens.anon)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          var response = res.body;
          expect(response).to.be.jsonSchema(jsonSchemaPollGet());
          done(err);
        });
    });
  });
};



// JSON-Schema for a response when POSTing to /poll/:id/votes
var jsonSchemaPollIdVotePost = function() {
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
              'created': {
                'type': 'string'
              },
              'updated': {
                'type': 'string'
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
        'type': 'object',
        'properties': {
          'self': {
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

var jsonSchemaPollIdRestaurantsPost = function()  {
  return {
    '$schema': 'http://json-schema.org/draft-04/schema#',
    'type': 'object',
    'properties': {
      'links': {
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
          }
        },
        'required': ['type', 'id', 'attributes']
      },
    },
    'required': [
      'links',
      'data'
    ]
  };
};

// semi functioning schema for a poll object, not checking in included or relations, only
// that they exist
var jsonSchemaPollGet = function() {
  return {
    '$schema': 'http://json-schema.org/draft-04/schema#',
    'id': 'http://jsonschema.net',
    'type': 'object',
    'properties': {
      'links': {
        'id': 'http://jsonschema.net/links',
        'type': 'object',
        'properties': {
          'self': {
            'id': 'http://jsonschema.net/links/self',
            'type': 'string'
          }
        },
        'required': [
          'self'
        ]
      },
      'data': {
        'id': 'http://jsonschema.net/data',
        'type': 'array',
        'items': {
          'id': 'http://jsonschema.net/data/0',
          'type': 'object',
          'properties': {
            'type': {
              'id': 'http://jsonschema.net/data/0/type',
              'type': 'string'
            },
            'id': {
              'id': 'http://jsonschema.net/data/0/id',
              'type': 'string'
            },
            'attributes': {
              'id': 'http://jsonschema.net/data/0/attributes',
              'type': 'object',
              'properties': {
                'name': {
                  'id': 'http://jsonschema.net/data/0/attributes/name',
                  'type': 'string'
                },
                'expires': {
                  'id': 'http://jsonschema.net/data/0/attributes/expires',
                  'type': 'string'
                },
                'created': {
                  'id': 'http://jsonschema.net/data/0/attributes/created',
                  'type': 'string'
                },
                'allowNewRestaurants': {
                  'id': 'http://jsonschema.net/data/0/attributes/allowNewRestaurants',
                  'type': 'boolean'
                }
              }
            },
            'links': {
              'id': 'http://jsonschema.net/data/0/links',
              'type': 'object',
              'properties': {
                'self': {
                  'id': 'http://jsonschema.net/data/0/links/self',
                  'type': 'string'
                }
              }
            }
          }
        }
      }
    },
    'required': [
      'links',
      'data'
    ]
  };
};

var jsonSchemaPollPost = function() {
  return {
    'id': 'jsonSchemaPollPost',
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
              'expires': {
                'id': 'http://jsonschema.net/data/attributes/expires',
                'type': 'string'
              },
              'created': {
                'id': 'http://jsonschema.net/data/attributes/created',
                'type': 'string'
              },
              'allowNewRestaurants': {
                'id': 'http://jsonschema.net/data/attributes/allowNewRestaurants',
                'type': 'boolean'
              }
            }
          },
          'relationships': {
            'id': 'http://jsonschema.net/data/relationships',
            'type': 'object',
            'properties': {
              'creator': {
                'id': 'http://jsonschema.net/data/relationships/creator',
                'type': 'object',
                'properties': {
                  'data': {
                    'id': 'http://jsonschema.net/data/relationships/creator/data',
                    'type': 'object',
                    'properties': {
                      'type': {
                        'id': 'http://jsonschema.net/data/relationships/creator/data/type',
                        'type': 'string'
                      },
                      'id': {
                        'id': 'http://jsonschema.net/data/relationships/creator/data/id',
                        'type': 'string'
                      }
                    }
                  }
                }
              },
              'users': {
                'id': 'http://jsonschema.net/data/relationships/users',
                'type': 'object',
                'properties': {
                  'data': {
                    'id': 'http://jsonschema.net/data/relationships/users/data',
                    'type': 'array',
                    'items': {
                      'id': 'http://jsonschema.net/data/relationships/users/data/0',
                      'type': 'object',
                      'properties': {
                        'type': {
                          'id': 'http://jsonschema.net/data/relationships/users/data/0/type',
                          'type': 'string'
                        },
                        'id': {
                          'id': 'http://jsonschema.net/data/relationships/users/data/0/id',
                          'type': 'string'
                        }
                      }
                    }
                  }
                }
              },
              'restaurants': {
                'id': 'http://jsonschema.net/data/relationships/restaurants',
                'type': 'object',
                'properties': {
                  'data': {
                    'id': 'http://jsonschema.net/data/relationships/restaurants/data',
                    'type': 'array',
                    'items': {
                      'id': 'http://jsonschema.net/data/relationships/restaurants/data/0',
                      'type': 'object',
                      'properties': {
                        'type': {
                          'id': 'http://jsonschema.net/data/relationships/restaurants/data/0/type',
                          'type': 'string'
                        },
                        'id': {
                          'id': 'http://jsonschema.net/data/relationships/restaurants/data/0/id',
                          'type': 'string'
                        }
                      }
                    }
                  }
                }
              },
              'group': {
                'id': 'http://jsonschema.net/data/relationships/group',
                'type': 'object',
                'properties': {
                  'data': {
                    'id': 'http://jsonschema.net/data/relationships/group/data',
                    'type': 'object',
                    'properties': {
                      'type': {
                        'id': 'http://jsonschema.net/data/relationships/group/data/type',
                        'type': 'string'
                      },
                      'id': {
                        'id': 'http://jsonschema.net/data/relationships/group/data/id',
                        'type': ['string', 'null']
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
        'id': 'http://jsonschema.net/links',
        'type': 'object',
        'properties': {
          'self': {
            'id': 'http://jsonschema.net/links/self',
            'type': 'string'
          }
        }
      },
      'included': {
        'id': 'http://jsonschema.net/included',
        'type': 'array',
        'items': {
          'anyOf': [{
            'id': 'http://jsonschema.net/included/0',
            'type': 'object',
            'properties': {
              'type': {
                'id': 'http://jsonschema.net/included/0/type',
                'type': 'string'
              },
              'id': {
                'id': 'http://jsonschema.net/included/0/id',
                'type': 'string'
              },
              'attributes': {
                'id': 'http://jsonschema.net/included/0/attributes',
                'type': 'object',
                'properties': {
                  'name': {
                    'id': 'http://jsonschema.net/included/0/attributes/name',
                    'type': 'string'
                  },
                  'photo': {
                    'id': 'http://jsonschema.net/included/0/attributes/photo',
                    'type': ['null', 'string']
                  },
                  'anonymous': {
                    'id': 'http://jsonschema.net/included/0/attributes/anon',
                    'type': 'boolean'
                  }
                }
              },
              'links': {
                'id': 'http://jsonschema.net/included/0/links',
                'type': 'object',
                'properties': {
                  'self': {
                    'id': 'http://jsonschema.net/included/0/links/self',
                    'type': 'string'
                  }
                }
              }
            }
          }, {
            'id': 'http://jsonschema.net/included/1',
            'type': 'object',
            'properties': {
              'type': {
                'id': 'http://jsonschema.net/included/1/type',
                'type': 'string'
              },
              'id': {
                'id': 'http://jsonschema.net/included/1/id',
                'type': 'string'
              },
              'attributes': {
                'id': 'http://jsonschema.net/included/1/attributes',
                'type': 'object',
                'properties': {
                  'name': {
                    'id': 'http://jsonschema.net/included/1/attributes/name',
                    'type': 'string'
                  },
                  'photo': {
                    'id': 'http://jsonschema.net/included/1/attributes/photo',
                    'type': ['string', 'null']
                  },
                  'anonymous': {
                    'id': 'http://jsonschema.net/included/1/attributes/anonymous',
                    'type': 'boolean'
                  }
                }
              },
              'links': {
                'id': 'http://jsonschema.net/included/1/links',
                'type': 'object',
                'properties': {
                  'self': {
                    'id': 'http://jsonschema.net/included/1/links/self',
                    'type': 'string'
                  }
                }
              }
            }
          }, {
            'id': 'http://jsonschema.net/included/2',
            'type': 'object',
            'properties': {
              'type': {
                'id': 'http://jsonschema.net/included/2/type',
                'type': 'string'
              },
              'id': {
                'id': 'http://jsonschema.net/included/2/id',
                'type': 'string'
              },
              'attributes': {
                'id': 'http://jsonschema.net/included/2/attributes',
                'type': 'object',
                'properties': {
                  'name': {
                    'id': 'http://jsonschema.net/included/2/attributes/name',
                    'type': 'string'
                  },
                  'lat': {
                    'id': 'http://jsonschema.net/included/2/attributes/lat',
                    'type': 'string'
                  },
                  'lng': {
                    'id': 'http://jsonschema.net/included/2/attributes/lng',
                    'type': 'string'
                  }
                }
              },
              'links': {
                'id': 'http://jsonschema.net/included/2/links',
                'type': 'object',
                'properties': {
                  'self': {
                    'id': 'http://jsonschema.net/included/2/links/self',
                    'type': 'string'
                  }
                }
              }
            }
          }, {
            'id': 'http://jsonschema.net/included/3',
            'type': 'object',
            'properties': {
              'type': {
                'id': 'http://jsonschema.net/included/3/type',
                'type': 'string'
              },
              'id': {
                'id': 'http://jsonschema.net/included/3/id',
                'type': 'string'
              },
              'attributes': {
                'id': 'http://jsonschema.net/included/3/attributes',
                'type': 'object',
                'properties': {
                  'name': {
                    'id': 'http://jsonschema.net/included/3/attributes/name',
                    'type': 'string'
                  }
                }
              },
              'links': {
                'id': 'http://jsonschema.net/included/3/links',
                'type': 'object',
                'properties': {
                  'self': {
                    'id': 'http://jsonschema.net/included/3/links/self',
                    'type': 'string'
                  }
                }
              }
            }
          }]
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
var jsonSchemaPollIdUsersPost = function()  {
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
              'pollId': {
                'type': 'string'
              },
              'joinedPoll': {
                'type': 'string'
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
        'type': 'object',
        'properties': {
          'self': {
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
