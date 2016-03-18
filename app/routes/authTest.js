var router = require('express').Router();

router.get('/', function(req, res) {
  if (req.validUser.admin === true) {
    res.send('Welcome ' + req.validUser.name +
      ' your token has been validated and your email is ' +
      req.validUser.email + ' you are also admin');

  } else {
    res.send('Welcome ' + req.validUser.name +
      ' your token has been validated and your email is ' + req.validUser.email);
  }
});


module.exports = router;
