/*
Kommenterade ut detta för att node inte ska ladda in paket och moduler i denna mallen.

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised'); //Needed for promise-testing
var Promise = require('bluebird'); //Our promise-module
var moduleToTest = require('./path_to_the_module'); //Use require in this case
var expect = chai.expect;
chai.should();
chai.use(chaiAsPromised);

*/

// Start with this describe: "Testing nameOfTheModule (nameOfTheModule.js)
describe.skip('Testing ModuleToTest  (moduleToTest.js)', function() {

  var validParameters;
  var nonValidParameters;

  //Initialize what you have to in a before()
  before(function intitialize() {
    validParameters = {
      parameterThatExists: 'CorrectValueForThisParameter'
    };
    nonValidParameters = {
      parameterThatExists: ['INCORRECT_ValueForThisParameter']
    };
  });

  //Group tests together using describe() with a short text describing what the tests are testing
  describe('testing the get-function', function() {
    it('should respond to get', function() {
      expect(moduleToTest).to.respondTo('get');
    });

    it('should eventually return true with valid parameters', function() {
      return moduleToTest.get(validParameters).eventually.equal(true);
    });

    it('should be rejected with valid parameters', function() {
      return moduleToTest.get(nonValidParameters).be.rejected;
    });

  });

});
