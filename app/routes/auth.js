var router = require('express').Router();
var jwt = require('jsonwebtoken');
var knex = require('../shared/knex');
var bodyParser = require('body-parser');
var cert = process.env.JWTSECRET;

router.use(bodyParser.urlencoded({
  extended: true
}));

router.post('/', function(req, res) {

  var user = {
    name: undefined,
    email: undefined
  };

  knex.select('*').from('user').where('email', '=', req.body.email)
    .then(function(result) {
      if (req.body.email === result[0].email && req.body.password === result[0].password) {
        user.name = result[0].name;
        user.email = result[0].email;

        var token = jwt.sign(user, cert, {
          expiresIn: '1m' // expires in 1 minute
        });

        res.json({
          authentication: true,
          message: 'Enjoy your token ' + user.name,
          token: token
        });
      }
    }).catch(function() {
      res.json({
        authentication: false,
        message: 'Your email or password is incorrect',
        token: false
      });
    });
});

module.exports = router;
