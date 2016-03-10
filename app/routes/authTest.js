var router = require('express').Router();

router.get('/', function(req, res) {
  if (req.decoded.admin === true) {
    res.send('Welcome ' + req.decoded.name +
      ' your token has been validated and your email is ' +
      req.decoded.email + ' you are also admin');

  } else {
    res.send('Welcome ' + req.decoded.name +
      ' your token has been validated and your email is ' + req.decoded.email);
  }
});


module.exports = router;
