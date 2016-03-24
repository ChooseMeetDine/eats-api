var router = require('express').Router();
var jwt = require('jsonwebtoken');
var knex = require('../shared/database/knex');
var bodyParser = require('body-parser');
var cert = process.env.JWTSECRET;
var authRequest = require('../validators/auth');

router.use(bodyParser.urlencoded({
  extended: true
}));

router.post('/', authRequest.checkData, function(req, res) {

  var user = {
    id: undefined,
    name: undefined,
    email: undefined,
    admin: undefined,
    role: undefined
  };

  knex.select('*').from('user').where('email', '=', req.body.email)
    .then(function(result) {
      if (req.body.email === result[0].email && req.body.password === result[0].password) {
        user.id = result[0].id;
        user.name = result[0].name;
        user.email = result[0].email;
        user.admin = result[0].admin;

        var token;

        if (user.admin === true) {
          token = jwt.sign(user, cert, {
            expiresIn: '168h' // expires in one week (168 hours)
          });
        } else {
          token = jwt.sign(user, cert, {
            expiresIn: '5m' // expires in 1 minute
          });
        }

        res.json({
          authentication: true,
          message: 'Welcome ' + user.name,
          token: token
        });
      } else {
        res.status(403).json({
          authentication: false,
          message: 'Your email or password is incorrect',
          token: false
        });
      }
    }).catch(function() {
      res.status(403).json({
        authentication: false,
        message: 'You need to POST email and password',
        token: false
      });
    });
});

module.exports = router;
