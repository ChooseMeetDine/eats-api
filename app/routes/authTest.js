var router = require('express').Router();

router.get('/', function(req, res) {
  /*
  if (req.validUser.admin === true) {
    res.send('Welcome ' + req.validUser.name +
      ' your token has been validated and your email is ' +
      req.validUser.email + ' you are also admin');

  } else {
    res.status(403).send('I am sorry ' + req.validUser.name +
      ' but you are not allowed to access this data');
  }*/
  if (req.validUser.admin === true) {
    res.json({
      message: 'Welcome admin'
    });
  } else {
    console.log('testing ---- >' + req.validUser.role);
    res.json(req.validUser.role);
  }

});


module.exports = router;
