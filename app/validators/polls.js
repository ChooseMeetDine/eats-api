var isvalid = require('isvalid');
var pollValidator = {};

pollValidator.post = function(req, res, next) {
  var schema = {
    type: Object,
    unknownKeys: 'deny',
    required: 'implicit',
    schema: {
      'name': {
        type: String,
        required: true,
        errors: {
          type: 'name must be a String',
          required: 'name is required.'
        }
      },
      'fixed_vote': {
        type: Boolean,
        required: false,
        default: false,
        errors: {
          type: 'fixed_vote must be a boolean'
        }
      },
    }
  };

  isvalid(req.body, schema, function(err, validData) {
    if (err) {
      //Hantera fel på ett bättre sätt
      res.status(400).send(err);
    } else {
      req.valid = validData;
      next();
    }
  });
};


module.exports = pollValidator;
