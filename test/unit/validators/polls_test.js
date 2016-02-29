var expect = require('chai').expect;
var validator = require('../../../app/validators/polls');

describe.skip('Testing the poll validator (polls.js)', function() {

  describe('testing the post-validator ', function() {


    describe('description', function() {

      it('should set req.valid to the same ', function(done) {

        var req = {};
        req.body = {
          name: 'name'
        };
        var res = {};
        var validate = function(req, res) {
          expect(req.valid).to.equal(body);
          done();
        };
        validator.post(req, res, validate);

      });
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
