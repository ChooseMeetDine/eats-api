var _ = require('underscore');

// Instantitate the module with a resource name
function JsonApiCollectionModule(input) {
  if (!_.isString(input.resource)) {
    throw new Error('Validation in JSON-API-collection module failed:  "resource" is not a String');
  }
  this.links = {
    self: createResourceLink(input)
  };
  this.data = [];
}

var validateInput = function(input) {
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
    throw new Error('Validation in JSON-API module failed: variable "id" is not a string');
  }
};

// Add object to collection
//
//   STANDARD EXAMPLE
//
// var creatorRelation = {
//   data: {
//     id: 'USER_ID_1',
//     name: 'Per Persson',
//     photo: 'https://imgur.com/erqwfdsco92.jpg',
//     anonymous: false
//   },
//   type: 'user', //Type of object
//   resource: 'users' //System resource name
// };
//
//  Add object to collection
//
// var voteRelation2 = {
//   data: {
//     id: 'VOTE_ID_1',
//     created: '123-12-31-23123',
//     updated: '123-12-31-23123',
//   },
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
JsonApiCollectionModule.prototype.addObject = function(input) {
  validateInput(input);
  if (!this.data.relationships) { //create relationships if it does not exist
    this.data.relationships = {};
  }
  var newObject = {
    type: input.type,
    id: input.data.id,
    links: {
      self: createResourceLink(input)
    },
    attributes: input.data
  };
  delete newObject.attributes.id; //ID should only exist in data.id and not in attributes

  //If this relation-object has it's own relations, add them to newRel
  if (input.relationships) {
    newObject.relationships = createSubRelations(input, this);
  }

  this.data.push(newObject);

};

// Creates a link with API_URL and the resource name (and id if it exists)
var createResourceLink = function(resource) {
  var link = process.env.API_URL + resource.resource;
  if (resource.data && resource.data.id) {
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
  var i, current;
  for (i = 0; i < model.data.length; i++) {
    current = model.data[i];
    if (current.id === input.data.id) { //Improve this if our IDs are no longer completely unique
      return true;
    }
  }

  for (i = 0; i < model.included.length; i++) {
    current = model.included[i];
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
  return relationships;
};

var validateRelationInput = function(input) {
  if (!_.isString(input.relation)) {
    throw new Error('Validation in JSON-API module failed: variable "relation" is not a String');
  }
  validateInput(input);
};

module.exports = JsonApiCollectionModule;
