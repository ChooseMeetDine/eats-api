/*
Kommenterade ut detta för att node inte ska ladda in paket och moduler i denna mallen.

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised'); //Needed for promise-testing
var proxyquire = require('proxyquire'); //Needed for mocking dependencies
var Promise = require('bluebird'); //Our promise-module
var moduleToTestPath = './path_to_the_module'; //path to the module, dont require it.
var expect = chai.expect;
chai.should();
chai.use(chaiAsPromised);
*/

// Start with this describe: "Testing nameOfTheModule (nameOfTheModule.js)
describe.skip('Testing ModuleToTest  (moduleToTest.js)', function() {

  var databaseMock; //Mockobject for database
  var theModule; //The module to test, which will be intitialized with databaseMock

  //Initialize what you have to in a before()
  before(function intitialize() {

    //Create the databaseMock. This can be done in another file,
    //if the mock will be used by other modules too
    databaseMock = {
      getAll: function() {
        return Promise.resolve('OK');
      },
      getWithId: function() {
        return Promise.reject('ERROR');
      }
    };

    //THIS IS INSTEAD OF: var module = require('pathtomodule/module.js')
    //The module we want to test contains the code:
    //  var database = require ('./database');
    //and using this proxyquire will change our module dependency from the original
    //database-module to our mock.
    //The './database' must be exactly the name and/or path of that in original module-file.
    //Which means, if it's a path to a .js-file, DONT use the path from this file.
    theModule = proxyquire(moduleToTestPath, {
      './database': databaseMock
    });
  });

  //Group tests together using describe() with a short text describing what the tests are testing
  describe('checking existance of CRUD-operations', function() {

    //Short description of the test
    it('should have a read-operations', function() {
      expect(theModule).to.respondTo('read');
    });
    it('should have a remove-operations', function() {
      expect(theModule).to.respondTo('remove');
    });
    it('should have a create-operations', function() {
      expect(theModule).to.respondTo('create');
    });
    it('should have a update-operations', function() {
      expect(theModule).to.respondTo('update');
    });
  });

  //New describe for another set of tests
  describe('testing the getAll-function', function() {

    // This test is for a function that retuns a promise.
    // When this is the case, and you want to check the result of the promise
    // use .then(function(result){  expect() inside here   })
    it('should return "OK"', function() {
      return theModule.getAll().then(function(result) {
        expect(result).to.equal('OK');
      });
    });
  });

  describe('testing the getWithId-function', function() {
    it('should return error', function() {
      return theModule.getWithId().should.be.rejected;
    });
  });

});
