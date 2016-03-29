var router = require('express').Router();
var jwt = require('jsonwebtoken');
var knex = require('../shared/database/knex');
var bodyParser = require('body-parser');
var cert = process.env.JWTSECRET;
var authRequest = require('../validators/auth');
var moniker = require('moniker');

router.use(bodyParser.urlencoded({
  extended: true
}));

router.post('/', authRequest.checkData, function(req, res) {

  var user = {
    id: undefined,
    name: undefined,
    email: undefined,
    admin: undefined,
    anon: undefined,
    role: undefined
  };

  knex.select('*').from('user').where('email', '=', req.body.email)
    .then(function(result) {
      if (req.body.email === result[0].email && req.body.password === result[0].password) {
        user.id = result[0].id;
        user.name = result[0].name;
        user.email = result[0].email;
        user.admin = result[0].admin;
        user.anon = result[0].anon;

        var token;

        if (user.admin === true) {
          token = jwt.sign(user, cert, {
            expiresIn: '168h' //NOTE expires in one week (168 hours)
          });
        } else {
          token = jwt.sign(user, cert, {
            expiresIn: '5m' //NOTE expires in 5 minutes
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

router.get('/anonymous', function(req, res) {

  var anonymousId;
  var randomNameGenerator = moniker.choose();

  knex.insert({
      name: 'anonymous ' + randomNameGenerator,
      last_login: knex.raw('now()'),
      registration_date: knex.raw('now()'),
      anon: true
    })
    .into('user')
    .returning('id')
    .then(function(result) {
      console.log(result[0]);
      anonymousId = result[0];
    }).catch(function(error) {
      console.log(error);
    });

  var anonymousUser = {
    id: anonymousId,
    anon: true,
    role: 'anonymous'
  };

  var token = jwt.sign(anonymousUser, cert, {
    expiresIn: '24h' //NOTE expires in 24h
  });

  res.json({
    message: 'Welcome anonymous ' + randomNameGenerator,
    token: token
  });
});

console.log(moniker.choose());

module.exports = router;
