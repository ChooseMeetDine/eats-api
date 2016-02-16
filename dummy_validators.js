/** Dummy file to make sure the coverage tests are run correctly **/

var validators = {};

validators.isString = function(input) {
  if (input !== null) {
    return true;
  } else {
    return false;
  }
};

module.exports = validators;
