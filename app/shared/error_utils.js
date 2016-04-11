var errorUtils = {};

errorUtils.checkForUnkownKeyError = function(err) {
  if (err.message === 'Unknown key.') {
    err.message = 'Key ' + err.keyPath[0] + ' cannot be used on this resource, or is misspelled.' +
      ' Please visit our documentation at /docs for a list of valid parameters';
  }
};

module.exports = errorUtils;
