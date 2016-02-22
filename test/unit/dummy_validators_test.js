/** Dummy test file to make sure the coverage tests are run correctly **/

var expect = require('chai').expect;
var validators = require('../../dummy_validators');

describe('Testing validators', function ()  {
  describe('Testing string validator', function ()  {
    it('should be true when string is not null', function ()  {
      expect(validators.isString('hej')).to.be.true;
    });
  });
});
