/*
Kommenterade ut detta för att node inte ska ladda in paket och moduler i denna mallen.
var expect = require('chai').expect;
var validator = require('../../app/utils/validators');

*/
describe.skip('Testing the validator', function() {

  describe('testing the isString function', function() {
    it('should return true for "null"', function() {
      expect(validator.isString('null')).to.equal(true);
    });
    it('should return false for null', function() {
      expect(validator.isString(null)).to.equal(false);
    });
    it('should return false for undefined', function() {
      expect(validator.isString(undefined)).to.equal(false);
    });
    it('should return false for a 123', function() {
      expect(validator.isString(123)).to.equal(false);
    });
    it('should return false for {}', function() {
      expect(validator.isString({})).to.equal(false);
    });
  });
});
