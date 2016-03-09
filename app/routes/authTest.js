var router = require('express').Router();

router.get('/', function(req, res) {
  res.send('Welcome ' + req.decoded.name +
    ' your token has been validated and your email is ' + req.decoded.email);
});

module.exports = router;
