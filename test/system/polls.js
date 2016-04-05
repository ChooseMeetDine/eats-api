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

// semi functioning schema for a poll object, not checking in included or relations, only
// that they exist
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
                'type': 'string'
              },
              'allowNewRestaurants': {
                'type': 'boolean'
              }
            }
          },
          'relationships': {
            'type': 'object',
            'properties': {
              'creator': {
                'type': 'object',
              },
              'restaurants': {
                'type': 'object',
              },
              'users': {
                'type': 'object',
              },
              'group': {
                'type': 'object',
              },
              'votes': {
                'type': 'object',
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
      'included': {
        'type': 'array',
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
      'included',
      'links'
    ]
  };
};
