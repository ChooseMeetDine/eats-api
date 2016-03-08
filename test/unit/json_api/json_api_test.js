var expect = require('chai').expect;
var jsonApiModule = require('../../../app/json_api/json_api');
var main, moduleInstance, creatorRelation, voteRelation;

describe('Testing the JSON-API module (json_api.js)', function() {

  describe('testing constructor correctly without adding relations', function() {
    before(function() {
      createBaseObjects();
      moduleInstance = new jsonApiModule(main);
    });

    it('should only have data and links as keys', function() {
      expect(moduleInstance).to.have.all.keys(['data', 'links']);
    });

    it('should only have "type", "id", "attributes" as keys at data-variable', function() {
      expect(moduleInstance.data).to.have.all.keys(['type', 'id', 'attributes']);
    });

    it('should have data.id: "1"', function() {
      expect(moduleInstance.data.id).to.equal('1');
    });

    it('should have data.type: "poll"', function() {
      expect(moduleInstance.data.type).to.equal('poll');
    });

    it('should have data.attributes.name: "Odd Hill, team 2"', function() {
      expect(moduleInstance.data.attributes.name).to.equal('Odd Hill, team 2');
    });

    it('should have data.attributes.expires: "2016-02-23T22:49:05Z"', function() {
      expect(moduleInstance.data.attributes.expires).to.equal('2016-02-23T22:49:05Z');
    });

    it('should have data.attributes.created: "2016-02-01T15:20:05Z"', function() {
      expect(moduleInstance.data.attributes.created).to.equal('2016-02-01T15:20:05Z');
    });

    it('should have data.attributes.allowNewRestaurants: false', function() {
      expect(moduleInstance.data.attributes.allowNewRestaurants).to.equal(false);
    });

    it('should have self-link containing: "poll"', function() {
      expect(moduleInstance.links.self).to.contain('polls');
    });
  });

  describe('inserting only creatorRelation', function() {
    before(function() {
      createBaseObjects();
      moduleInstance = new jsonApiModule(main);
      moduleInstance.addRelation(creatorRelation);
    });

    it('should only have "data", "included", "links" as keys', function() {
      expect(moduleInstance).to.have.all.keys(['data', 'included', 'links']);
    });

    it('should have length:1 of included', function() {
      expect(moduleInstance.included.length).to.equal(1);
    });

    it('should only have "type", "id", "links", "attributes" as keys at included[0]', function() {
      expect(moduleInstance.included[0]).to.have.all.keys(['type', 'id', 'links', 'attributes']);
    });

    it('should have included[0].type: "user"', function() {
      expect(moduleInstance.included[0].type).to.equal('user');
    });

    it('should have included[0].id: "2"', function() {
      expect(moduleInstance.included[0].id).to.equal('2');
    });

    it('should have included[0].attributes.name: "Per Persson"', function() {
      expect(moduleInstance.included[0].attributes.name).to.equal('Per Persson');
    });

    it('should have included[0].attributes.photo: "https://imgur.com/1.jpg"', function() {
      expect(moduleInstance.included[0].attributes.photo).to.equal('https://imgur.com/1.jpg');
    });

    it('should have included[0].attributes.anonymous: false', function() {
      expect(moduleInstance.included[0].attributes.anonymous).to.equal(false);
    });

    it('should have included[0].links.self containing: "users"', function() {
      expect(moduleInstance.included[0].links.self).to.contain('users');
    });

    it('should only have "creator" as key in data.relationships', function() {
      expect(moduleInstance.data.relationships).to.have.all.keys(['creator']);
    });

    it('should have type object at data.relationships.creator', function() {
      expect(moduleInstance.data.relationships.creator).to.be.an('object');
    });

    it('should only have "data" as key in data.relationships.creator', function() {
      expect(moduleInstance.data.relationships.creator).to.have.all.keys(['data']);
    });

    it('should only have "type" and "id" as keys in data.relationships.creator.data', function() {
      expect(moduleInstance.data.relationships.creator.data).to.have.all.keys(['type', 'id']);
    });

    it('should only have included[0].id equal data.relationships.creator.data.id', function() {
      var creatorID = moduleInstance.data.relationships.creator.data.id;
      var includeID = moduleInstance.included[0].id;
      expect(creatorID).to.equal(includeID);
    });

  });

  describe('inserting only creatorRelation, but twice', function() {
    before(function() {
      createBaseObjects();
      moduleInstance = new jsonApiModule(main);
      moduleInstance.addRelation(creatorRelation);
      createBaseObjects();
      moduleInstance.addRelation(creatorRelation);
    });

    it('should only have "data", "included", "links" as keys', function() {
      expect(moduleInstance).to.have.all.keys(['data', 'included', 'links']);
    });

    it('should have length:1 of included', function() {
      expect(moduleInstance.included.length).to.equal(1);
    });

    it('should only have "type", "id", "links", "attributes" as keys at included[0]', function() {
      expect(moduleInstance.included[0]).to.have.all.keys(['type', 'id', 'links', 'attributes']);
    });

    it('should have included[0].type: "user"', function() {
      expect(moduleInstance.included[0].type).to.equal('user');
    });

    it('should have included[0].id: "2"', function() {
      expect(moduleInstance.included[0].id).to.equal('2');
    });

    it('should have included[0].attributes.name: "Per Persson"', function() {
      expect(moduleInstance.included[0].attributes.name).to.equal('Per Persson');
    });

    it('should have included[0].attributes.photo: "https://imgur.com/1.jpg"', function() {
      expect(moduleInstance.included[0].attributes.photo).to.equal('https://imgur.com/1.jpg');
    });

    it('should have included[0].attributes.anonymous: false', function() {
      expect(moduleInstance.included[0].attributes.anonymous).to.equal(false);
    });

    it('should have included[0].links.self containing: "users"', function() {
      expect(moduleInstance.included[0].links.self).to.contain('users');
    });

    it('should only have "creator" as key in data.relationships', function() {
      expect(moduleInstance.data.relationships).to.have.all.keys(['creator']);
    });

    it('should have type object at data.relationships.creator', function() {
      expect(moduleInstance.data.relationships.creator).to.be.an('object');
    });

    it('should only have "data" as key in data.relationships.creator', function() {
      expect(moduleInstance.data.relationships.creator).to.have.all.keys(['data']);
    });

    it('should only have "type" and "id" as keys in data.relationships.creator.data', function() {
      expect(moduleInstance.data.relationships.creator.data).to.have.all.keys(['type', 'id']);
    });

    it('should only have included[0].id equal data.relationships.creator.data.id', function() {
      var creatorID = moduleInstance.data.relationships.creator.data.id;
      var includeID = moduleInstance.included[0].id;
      expect(creatorID).to.equal(includeID);
    });

  });

  describe('inserting only voteRelation', function() {
    before(function() {
      createBaseObjects();
      moduleInstance = new jsonApiModule(main);
      moduleInstance.addRelation(voteRelation);
    });

    it('should only have "data", "included", "links" as keys', function() {
      expect(moduleInstance).to.have.all.keys(['data', 'included', 'links']);
    });

    it('should have length:3 of included', function() {
      expect(moduleInstance.included.length).to.equal(3);
    });

    it('should only have "type", "id", "links", "attributes" as keys at included[0]', function() {
      expect(moduleInstance.included[0]).to.have.all.keys(['type', 'id', 'links', 'attributes']);
    });

    it('should only have "type", "id", "links", "attributes" as keys at included[1]', function() {
      expect(moduleInstance.included[1]).to.have.all.keys(['type', 'id', 'links', 'attributes']);
    });

    it('should only have 5 keys at included[2]', function() {
      var requiredKeys = ['type', 'id', 'links', 'attributes', 'relationships'];
      expect(moduleInstance.included[2]).to.have.all.keys(requiredKeys);
    });

    it('should have an array at included[2].relationships', function() {
      expect(moduleInstance.included[2].relationships).to.be.an('object');
    });

    it('should only have 3 keys at included[2].relationships', function() {
      var requiredKeys = ['user', 'restaurant', 'poll'];
      expect(moduleInstance.included[2].relationships).to.have.all.keys(requiredKeys);
    });

    it('should only have "data", as keys at included[2].relationships.user', function() {
      expect(moduleInstance.included[2].relationships.user).to.have.all.keys(['data']);
    });

    it('should only have "type", "id" as keys at included[2].relationships.user.data', function() {
      expect(moduleInstance.included[2].relationships.user.data).to.have.all.keys(['type', 'id']);
    });

    it('should only have "data", as keys at included[2].relationships.restaurant', function() {
      expect(moduleInstance.included[2].relationships.restaurant).to.have.all.keys(['data']);
    });

    it('should only have 2 keys at included[2].relationships.restaurant.data', function() {
      var requiredKeys = ['type', 'id'];
      var result = moduleInstance.included[2].relationships.restaurant.data;
      expect(result).to.have.all.keys(requiredKeys);
    });

    it('should only have "data", as keys at included[2].relationships.poll', function() {
      expect(moduleInstance.included[2].relationships.poll).to.have.all.keys(['data']);
    });

    it('should only have "type", "id" as keys at included[2].relationships.poll.data', function() {
      expect(moduleInstance.included[2].relationships.poll.data).to.have.all.keys(['type', 'id']);
    });

    it('should only have "creator" as key in data.relationships', function() {
      expect(moduleInstance.data.relationships).to.have.all.keys(['votes']);
    });

    it('should have type object at data.relationships.votes', function() {
      expect(moduleInstance.data.relationships.votes).to.be.an('object');
    });
    it('should have type array at data.relationships.votes.data', function() {
      expect(moduleInstance.data.relationships.votes.data).to.be.an('array');
    });

    it('should only have "type" and "id" as keys in data.relationships.votes.data[0]', function() {
      expect(moduleInstance.data.relationships.votes.data[0]).to.have.all.keys(['type', 'id']);
    });

    it('should only have included[2].id equal data.relationships.creator.data.id', function() {
      var creatorID = moduleInstance.data.relationships.votes.data[0].id;
      var includeID = moduleInstance.included[2].id;
      expect(creatorID).to.equal(includeID);
    });

  });


  describe('inserting only voteRelation, but twice', function() {
    before(function() {
      createBaseObjects();
      moduleInstance = new jsonApiModule(main);
      moduleInstance.addRelation(voteRelation);
    });

    it('should only have "data", "included", "links" as keys', function() {
      expect(moduleInstance).to.have.all.keys(['data', 'included', 'links']);
    });

    it('should have length:3 of included', function() {
      expect(moduleInstance.included.length).to.equal(3);
    });

    it('should only have "type", "id", "links", "attributes" as keys at included[0]', function() {
      expect(moduleInstance.included[0]).to.have.all.keys(['type', 'id', 'links', 'attributes']);
    });

    it('should only have "type", "id", "links", "attributes" as keys at included[1]', function() {
      expect(moduleInstance.included[1]).to.have.all.keys(['type', 'id', 'links', 'attributes']);
    });

    it('should only have 5 keys at included[2]', function() {
      var requiredKeys = ['type', 'id', 'links', 'attributes', 'relationships'];
      expect(moduleInstance.included[2]).to.have.all.keys(requiredKeys);
    });

    it('should have an array at included[2].relationships', function() {
      expect(moduleInstance.included[2].relationships).to.be.an('object');
    });

    it('should only have 3 keys at included[2].relationships', function() {
      var requiredKeys = ['user', 'restaurant', 'poll'];
      expect(moduleInstance.included[2].relationships).to.have.all.keys(requiredKeys);
    });

    it('should only have "data", as keys at included[2].relationships.user', function() {
      expect(moduleInstance.included[2].relationships.user).to.have.all.keys(['data']);
    });

    it('should only have "type", "id" as keys at included[2].relationships.user.data', function() {
      expect(moduleInstance.included[2].relationships.user.data).to.have.all.keys(['type', 'id']);
    });

    it('should only have "data", as keys at included[2].relationships.restaurant', function() {
      expect(moduleInstance.included[2].relationships.restaurant).to.have.all.keys(['data']);
    });

    it('should only have 2 keys at included[2].relationships.restaurant.data', function() {
      var requiredKeys = ['type', 'id'];
      var result = moduleInstance.included[2].relationships.restaurant.data;
      expect(result).to.have.all.keys(requiredKeys);
    });

    it('should only have "data", as keys at included[2].relationships.poll', function() {
      expect(moduleInstance.included[2].relationships.poll).to.have.all.keys(['data']);
    });

    it('should only have "type", "id" as keys at included[2].relationships.poll.data', function() {
      expect(moduleInstance.included[2].relationships.poll.data).to.have.all.keys(['type', 'id']);
    });

    it('should only have "votes" as key in data.relationships', function() {
      expect(moduleInstance.data.relationships).to.have.all.keys(['votes']);
    });

    it('should have type object at data.relationships.votes', function() {
      expect(moduleInstance.data.relationships.votes).to.be.an('object');
    });
    it('should have type array at data.relationships.votes.data', function() {
      expect(moduleInstance.data.relationships.votes.data).to.be.an('array');
    });

    it('should only have "type" and "id" as keys in data.relationships.votes.data[0]', function() {
      expect(moduleInstance.data.relationships.votes.data[0]).to.have.all.keys(['type', 'id']);
    });

    it('should only have included[2].id equal data.relationships.creator.data.id', function() {
      var creatorID = moduleInstance.data.relationships.votes.data[0].id;
      var includeID = moduleInstance.included[2].id;
      expect(creatorID).to.equal(includeID);
    });

  });

  describe('inserting voteRelation and creator (same user id)', function() {
    before(function() {
      createBaseObjects();
      moduleInstance = new jsonApiModule(main);
      moduleInstance.addRelation(creatorRelation);
      moduleInstance.addRelation(voteRelation);
    });

    it('should only have "data", "included", "links" as keys', function() {
      expect(moduleInstance).to.have.all.keys(['data', 'included', 'links']);
    });

    it('should have length:3 of included', function() {
      expect(moduleInstance.included.length).to.equal(3);
    });

    it('should only have "type", "id", "links", "attributes" as keys at included[0]', function() {
      expect(moduleInstance.included[0]).to.have.all.keys(['type', 'id', 'links', 'attributes']);
    });

    it('should only have "type", "id", "links", "attributes" as keys at included[1]', function() {
      expect(moduleInstance.included[1]).to.have.all.keys(['type', 'id', 'links', 'attributes']);
    });

    it('should only have 5 keys at included[2]', function() {
      var requiredKeys = ['type', 'id', 'links', 'attributes', 'relationships'];
      expect(moduleInstance.included[2]).to.have.all.keys(requiredKeys);
    });

    it('should have an array at included[2].relationships', function() {
      expect(moduleInstance.included[2].relationships).to.be.an('object');
    });

    it('should only have 3 keys at included[2].relationships', function() {
      var requiredKeys = ['user', 'restaurant', 'poll'];
      expect(moduleInstance.included[2].relationships).to.have.all.keys(requiredKeys);
    });

    it('should only have "data", as keys at included[2].relationships.user', function() {
      expect(moduleInstance.included[2].relationships.user).to.have.all.keys(['data']);
    });

    it('should only have "type", "id" as keys at included[2].relationships.user.data', function() {
      expect(moduleInstance.included[2].relationships.user.data).to.have.all.keys(['type', 'id']);
    });

    it('should only have "data", as keys at included[2].relationships.restaurant', function() {
      expect(moduleInstance.included[2].relationships.restaurant).to.have.all.keys(['data']);
    });

    it('should only have 2 keys at included[2].relationships.restaurant.data', function() {
      var requiredKeys = ['type', 'id'];
      var result = moduleInstance.included[2].relationships.restaurant.data;
      expect(result).to.have.all.keys(requiredKeys);
    });

    it('should only have "data", as keys at included[2].relationships.poll', function() {
      expect(moduleInstance.included[2].relationships.poll).to.have.all.keys(['data']);
    });

    it('should only have "type", "id" as keys at included[2].relationships.poll.data', function() {
      expect(moduleInstance.included[2].relationships.poll.data).to.have.all.keys(['type', 'id']);
    });

    it('should only have "creator" and "votes" as key in data.relationships', function() {
      expect(moduleInstance.data.relationships).to.have.all.keys(['creator', 'votes']);
    });

    it('should have type object at data.relationships.votes', function() {
      expect(moduleInstance.data.relationships.votes).to.be.an('object');
    });
    it('should have type array at data.relationships.votes.data', function() {
      expect(moduleInstance.data.relationships.votes.data).to.be.an('array');
    });

    it('should only have "type" and "id" as keys in data.relationships.votes.data[0]', function() {
      expect(moduleInstance.data.relationships.votes.data[0]).to.have.all.keys(['type', 'id']);
    });

    it('should only have included[2].id equal data.relationships.votes.data.id', function() {
      var voteID = moduleInstance.data.relationships.votes.data[0].id;
      var includeID = moduleInstance.included[2].id;
      expect(voteID).to.equal(includeID);
    });

    it('should have type object at data.relationships.creator', function() {
      expect(moduleInstance.data.relationships.creator).to.be.an('object');
    });

    it('should only have "data" as key in data.relationships.creator', function() {
      expect(moduleInstance.data.relationships.creator).to.have.all.keys(['data']);
    });

    it('should only have "type" and "id" as keys in data.relationships.creator.data', function() {
      expect(moduleInstance.data.relationships.creator.data).to.have.all.keys(['type', 'id']);
    });

    it('should only have included[0].id equal data.relationships.creator.data.id', function() {
      var creatorID = moduleInstance.data.relationships.creator.data.id;
      var includeID = moduleInstance.included[0].id;
      expect(creatorID).to.equal(includeID);
    });

  });

  describe('inserting bad input', function() {


    it('should throw error for main witout id', function() {
      var badMain = {
        type: 'poll',
        resource: 'polls',
        data: {
          name: 'Odd Hill, team 2',
        }
      };
      var validationError = null;
      try {
        moduleInstance = new jsonApiModule(badMain);
      } catch (err) {
        validationError = err;
      }
      expect(validationError).to.not.equal(null);

    });

    it('should throw error for main with id as number', function() {
      var badMain = {
        type: 'poll',
        resource: 'polls',
        data: {
          id: 1,
          name: 'Odd Hill, team 2',
        }
      };
      var validationError = null;
      try {
        moduleInstance = new jsonApiModule(badMain);
      } catch (err) {
        validationError = err;
      }
      expect(validationError).to.not.equal(null);
    });

    it('should throw error for main as an array', function() {
      var badMain = [{
        type: 'poll',
        resource: 'polls',
        data: {
          id: '1',
          name: 'Odd Hill, team 2',
        }
      }];
      var validationError = null;
      try {
        moduleInstance = new jsonApiModule(badMain);
      } catch (err) {
        validationError = err;
      }
      expect(validationError).to.not.equal(null);
    });

    it('should throw error for main without type', function() {
      var badMain = {
        resource: 'polls',
        data: {
          id: '1',
          name: 'Odd Hill, team 2',
        }
      };
      var validationError = null;
      try {
        moduleInstance = new jsonApiModule(badMain);
      } catch (err) {
        validationError = err;
      }
      expect(validationError).to.not.equal(null);
    });

    it('should throw error for main without resource', function() {
      var badMain = {
        type: 'poll',
        data: {
          id: '1',
          name: 'Odd Hill, team 2',
        }
      };
      var validationError = null;
      try {
        moduleInstance = new jsonApiModule(badMain);
      } catch (err) {
        validationError = err;
      }
      expect(validationError).to.not.equal(null);
    });

    it('should throw error for main without data', function() {
      var badMain = {
        type: 'poll',
        resource: 'polls',
        id: '1',
        name: 'Odd Hill, team 2',
      };
      var validationError = null;
      try {
        moduleInstance = new jsonApiModule(badMain);
      } catch (err) {
        validationError = err;
      }
      expect(validationError).to.not.equal(null);
    });

    it('should throw error for relation without variable "relation"', function() {
      var badRelation = {
        type: 'poll',
        resource: 'polls',
        data: {
          id: '1',
          name: 'Odd Hill, team 2',
        }
      };
      createBaseObjects();
      var validationError = null;
      moduleInstance = new jsonApiModule(main);

      try {
        moduleInstance.addRelation(badRelation);
      } catch (err) {
        validationError = err;
      }
      expect(validationError).to.not.equal(null);
    });

    it('should throw error for relation with object in variable "relation"', function() {
      var badRelation = {
        type: 'poll',
        resource: 'polls',
        relation: {
          id: 123
        },
        data: {
          id: '1',
          name: 'Odd Hill, team 2',
        }
      };
      createBaseObjects();
      var validationError = null;
      moduleInstance = new jsonApiModule(main);

      try {
        moduleInstance.addRelation(badRelation);
      } catch (err) {
        validationError = err;
      }
      expect(validationError).to.not.equal(null);
    });


  });

});

var createBaseObjects = function() {
  main = {
    type: 'poll',
    resource: 'polls',
    data: {
      id: '1',
      name: 'Odd Hill, team 2',
      expires: '2016-02-23T22:49:05Z',
      created: '2016-02-01T15:20:05Z',
      allowNewRestaurants: false
    }
  };
  creatorRelation = {
    data: {
      id: '2',
      name: 'Per Persson',
      photo: 'https://imgur.com/1.jpg',
      anonymous: false
    },
    relation: 'creator',
    multiple: false,
    type: 'user',
    resource: 'users'
  };
  voteRelation = {
    data: {
      id: '20',
      created: '123-12-31-23123',
      updated: '123-12-31-23123',
    },
    relation: 'votes',
    multiple: true,
    type: 'vote',
    resource: 'votes',
    relationships: [{
      data: {
        id: '2',
      },
      relation: 'user',
      multiple: false,
      type: 'user',
      resource: 'users',
    }, {
      data: {
        id: '5',
      },
      relation: 'restaurant',
      multiple: false,
      type: 'restaurant',
      resource: 'restaurants',
    }, {
      data: {
        id: '1',
      },
      relation: 'poll',
      multiple: false,
      type: 'poll',
      resource: 'polls',
    }]
  };
  // restaurantRelation1 = {
  //   data: {
  //     id: '10',
  //     name: 'Din Restaurang',
  //     latitude: 56.1234,
  //     longitude: 14.1234,
  //     temporary: false
  //   },
  //   relation: 'restaurants',
  //   multiple: true,
  //   type: 'restaurant',
  //   resource: 'restaurants',
  // };
  // restaurantRelation2 = {
  //   data: {
  //     id: '11',
  //     name: 'Vår Restaurang',
  //     latitude: 56.1234,
  //     longitude: 14.1234,
  //     temporary: false
  //   },
  //   relation: 'restaurants',
  //   multiple: true,
  //   type: 'restaurant',
  //   resource: 'restaurants',
  // };
  // userRelation1 = {
  //   data: {
  //     id: '4',
  //     name: 'Lukas Lukasson',
  //     photo: 'https://imgur.com/1.jpg',
  //     anonymous: false
  //
  //   },
  //   relation: 'users',
  //   multiple: true,
  //   type: 'user',
  //   resource: 'users',
  // };
  // userRelation2 = {
  //   data: {
  //     id: '5',
  //     name: 'Mats Matsson',
  //     photo: 'https://imgur.com/1.jpg',
  //     anonymous: true
  //
  //   },
  //   relation: 'users',
  //   multiple: true,
  //   type: 'user',
  //   resource: 'users',
  // };
  // userRelation3 = {
  //   data: {
  //     id: '3',
  //     name: 'Per Persson',
  //     photo: 'https://imgur.com/1.jpg',
  //     anonymous: false
  //   },
  //   relation: 'users',
  //   multiple: true,
  //   type: 'user',
  //   resource: 'users'
  // };
  // groupRelation = {
  //   data: {
  //     id: '111',
  //     name: 'Odd hill',
  //   },
  //   relation: 'group',
  //   multiple: false,
  //   type: 'group',
  //   resource: 'groups'
  // };
};
