var _ = require('underscore');

// Create the main object to which relations can be added later
function JsonApiModule(main) {
  validateMainInput(main);
  this.data = {
    type: main.type,
    id: main.data.id,
    attributes: main.data
  };
  delete this.data.attributes.id; //ID should only exist in data.id and not in attributes
  this.links = [{
    self: createResourceLink(main)
  }];
}

var validateMainInput = function(input) {
  if (!_.isString(input.type)) {
    throw new Error('Validation in JSON-API module failed: variable "type" is not a String');
  }
  if (!_.isString(input.resource)) {
    throw new Error('Validation in JSON-API module failed: variable "resource" is not a String');
  }
  if (!_.isObject(input.data) || _.isArray(input.data) || _.isFunction(input.data)) {
    throw new Error('Validation in JSON-API module failed: variable "data" is not an Object');
  }
  if (!_.isString(input.data.id)) {
    throw new Error('Validation in JSON-API module failed: variable "id" is not a number');
  }
};

// Add relation to main object
//
//   STANDARD EXAMPLE FOR A RELATIONSHIP
//
// var creatorRelation = {
//   data: {
//     id: 'USER_ID_1',
//     name: 'Per Persson',
//     photo: 'https://imgur.com/erqwfdsco92.jpg',
//     anonymous: false
//   },
//   relation: 'creator', //Name of the relation
//   multiple: false, //since there is only one creator. Use true for users since there are many
//   type: 'user', //Type of object
//   resource: 'users' //System resource name
// };
//
//  EXAMPLE FOR A RELATIONSHIP THAT HAS IT'S OWN RELATIONSHIPS
//
// var voteRelation2 = {
//   data: {
//     id: 'VOTE_ID_1',
//     created: '123-12-31-23123',
//     updated: '123-12-31-23123',
//   },
//   relation: 'votes',
//   multiple: true,
//   type: 'vote',
//   resource: 'votes',
//   relationships: [{    //THIS IS THE IMPORTANT BIT
//     data: {            //relationships should be an array of objects with the exact structure
//       id: 'USER_ID_1', //as all other relation-objects (like creator above)
//     },                 //However, you can NOT use the relationships array on these sub-relations
//     relation: 'user',
//     multiple: false,
//     type: 'user',
//     resource: 'users',
//   }, {
//     data: {
//       id: 'RESTAURANT_ID_5',
//     },
//     relation: 'restaurant',
//     multiple: false,
//     type: 'restaurant',
//     resource: 'restaurants',
//   }, {
//     data: {
//       id: 'POLL_ID_1',
//     },
//     relation: 'poll',
//     multiple: false,
//     type: 'poll',
//     resource: 'polls',
//   }]
// };
JsonApiModule.prototype.addRelation = function(input) {
  validateRelationInput(input);
  if (!this.data.relationships) { //create relationships if it does not exist
    this.data.relationships = {};
  }
  var newRel = {
    type: input.type,
    id: input.data.id,
  };

  addRelationToIncludedIfNeeded(this, input);

  //Just aliases
  var relation = input.relation;
  var relationships = this.data.relationships;

  if (!input.multiple) {
    relationships[relation] = { //If single, it should be an object instead of array
      data: newRel
    };
    return;
  }

  if (!relationships[relation]) {
    relationships[relation] = { //If multiple, it should be an array instead of an object
      data: []
    };
  }

  //Only add the relation if it does not exist
  for (var i = 0; i < relationships[relation].data.length; i++) {
    if (relationships[relation].data[i].id === newRel.id) {
      return;
    }
  }
  relationships[relation].data.push(newRel);

};

var createResourceLink = function(resource) {
  var link = process.env.API_URL + resource.resource;
  if (resource.data.id) {
    link += '/' + resource.data.id;
  }
  return link;
};

var addRelationToIncludedIfNeeded = function(model, input) {
  if (!model.included) { //create included if it does not exist
    model.included = [];
  }

  //Dont inlcude input if it already exists
  if (existsInIncluded(model, input)) {
    return;
  }

  var newRel = {
    type: input.type,
    id: input.data.id,
    attributes: input.data,
    links: {
      self: createResourceLink(input)
    }
  };
  delete newRel.attributes.id; //ID should only exist in data.id and not in attributes

  //If this relation-object has it's own relations, add them to newRel
  if (input.relationships) {
    newRel.relationships = createSubRelations(input, model);
  }

  //Insert relation to included
  model.included.push(newRel);
};

// Returns true if relation exists in included or is the main object
var existsInIncluded = function(model, input) {
  if (input.data.id === model.data.id) {
    return true;
  }
  for (var i = 0; i < model.included.length; i++) {
    var current = model.included[i];
    if (current.id === input.data.id) { //Improve this if our IDs are no longer completely unique
      return true;
    }
  }
  return false;
};

// Creates a relationship object with all the relations of the parameter input
var createSubRelations = function(input, model) {
  var relationships = {};

  // Loop through all sub-relations
  for (var j = 0; j < input.relationships.length; j++) {
    var currentSubRelation = input.relationships[j];
    validateRelationInput(currentSubRelation);
    var subRel = {
      data: {
        id: currentSubRelation.data.id,
        type: currentSubRelation.type,
      }
    };

    //Do this recursivley since this sub-relation might have it's own relations
    addRelationToIncludedIfNeeded(model, currentSubRelation);

    //Just add if single
    if (!currentSubRelation.multiple) {
      relationships[currentSubRelation.relation] = subRel;
      continue;
    }
    //Create array if there is none
    if (!relationships[currentSubRelation.relation]) {
      relationships[currentSubRelation.relation] = [];
    }
    //Add to array
    relationships[currentSubRelation.relation].push(subRel);
  }
};

var validateRelationInput = function(input) {
  validateMainInput(input);
  if (!_.isString(input.relation)) {
    throw new Error('Validation in JSON-API module failed: variable "relation" is not a String');
  }
};

module.exports = JsonApiModule;
