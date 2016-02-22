/*

This is an example of a mock-object.
This mock-object could be used with proxyquire in unit tests is we need to test a
module that uses postgres, but we dont want the module to actualy use the database during testing.



var Promise = require('bluebird');
var options = {};


 * The wrapper-function just lets the test-files set options to the postgres mock.
 * the postgres-function mimicks the real module, with the same parameters,
 * return object it's function queryAsync.
 *
 * To decide how this mock should handle your request in a test, send in a
 * settings object:
 * {
 * 		resolve: {boolean} //true for resolve, false for reject
 * 		response: {any} //what to resolve
 * 		error: {any} //error to reject, for example MockError12345
 * }


function wrapper(settings) {
  options = settings;
  return postgres;
}

function postgres(connectionString) {
  return new Promise(function(resolve, reject) {
    return resolve(client);
  });
}

var client = {};
client.queryAsync = function(query) {
  return new Promise(function(resolve, reject) {
    if (options.resolve) {
      return resolve(options.response);
    } else {
      return reject(options.error);
    }
  });
};

module.exports = wrapper;



EXAMPLE USAGE OF THIS MOCK:

var pgMock = require('../mocks/postgres');
var pgMockResponses = require('../mocks/postgres_responses');
var proxyquire = require('proxyquire');
var moduleToTestPath = '../app/datahandler1/db';

describe('Testing a module that uses postgres (db.js)', function() {
  var query = 'select';

  it('should be fulfilled when postgres succeeds', function() {
    var settings = {
      resolve: true,
      response: pgMockResponses.malmoPoisCorrect,
    };
    var mock = pgMock(settings);
    var moduleToTest = proxyquire(moduleToTestPath, {
      '../utils/database/postgres': mock
    });
  });
  ....


*/
