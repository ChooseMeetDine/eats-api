var bcrypt = require('bcryptjs');
var encrypt = {};

encrypt.password = function(req, res, next) {
  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(req.validBody.password, salt);
  req.validBody.password = hash;
  next();
};

module.exports = encrypt;
