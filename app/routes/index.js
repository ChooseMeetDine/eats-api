var router = require('express').Router();
var aglio = require('aglio');
var pollRouter = require('../routes/polls');
var path = require('path');
var knex = require('../shared/knex');
var stormpath = require('express-stormpath');
var jwt = require('jsonwebtoken');

var cert = process.env.JWTSECRET;
var token;

router.use('/polls', pollRouter);

//TODO: Fix routers for everything below this comment.

//Fake endpoint
router.get('/users', function (req, res) {
  res.json({
    name: 'Musse',
    age: 30
  });
});

//------------------------- ROOT with jwt token creation-------/
router.get('/', stormpath.getUser, function (req, res) {
  if (req.user) {
    knex.select('*').from('user').where('email', '=', req.user.email)
      .then(function (result) {
        res.send('Welcome ' + result[0].name);
      }).catch(function (error) {
        res.send(error);
      });
  } else {
    jwt.verify(token, cert, function (err, decoded) {
      if (err) {
        var anonymus = {
          name: 'anonymus'
        };
        token = jwt.sign(anonymus, cert, {
          expiresIn: '30s'
        });
        res.send('Du gick till rooten i API:et och du är anonym och din token är ' + token);
      } else if (decoded) {
        res.send('Du gick till rooten i API:et och du är anonym och din token är ' + token);
      }
    });
  }
});

router.get('/docs', function (req, res) {
  var options = {
    themeTemplate: 'default',
    locals: {
      myVariable: 125
    }
  };

  aglio.renderFile('./public/docs/README.apib', './public/docs/documentation.html', options,
    function (err, warnings) {
      if (err) {
        return console.log(err);
      }
      if (warnings) {
        //console.log(warnings);
      }
      console.log(__dirname);
      res.sendFile(path.join(__dirname, '../../public/docs', 'documentation.html'));
    });
});

router.get('/goaldocs', function (req, res) {
  var options = {
    themeTemplate: 'default',
    locals: {
      myVariable: 125
    }
  };

  aglio.renderFile('./public/docs/GOALS.apib', './public/docs/goaldocs.html', options,
    function (err, warnings) {
      if (err) {
        return console.log(err);
      }
      if (warnings) {
        //console.log(warnings);
      }
      res.sendFile(path.join(__dirname, '../../public/docs', 'goaldocs.html'));
    });
});

//custom-logout
router.get('/log-out', stormpath.getUser, function (req, res) {
  if (req.user) {
    res.sendFile(__dirname + '/loggaut.html');
  } else {
    res.send('Not logged in');
  }
});

//Admin route test
router.get('/admin', stormpath.groupsRequired(['admin']), function (req, res) {
  res.send('Welcome admin');
});

//anonymus jwt test
router.get('/vote', stormpath.getUser, function (req, res) {
  //console.log(req);
  if (req.user) {
    knex.select('*').from('user').where('email', '=', req.user.email)
      .then(function (result) {
        res.send('Welcome to votes ' + result[0].name);
      }).catch(function (error) {
        res.send(error);
      });
  } else if (!req.user) {
    jwt.verify(token, cert, function (err, decoded) {
      if (err) {
        err = {
          name: 'TokenExpiredError',
          message: 'jwt expired'
        };
        res.json(err);
      } else if (decoded) {
        res.send('Welcome user with token ' + token);
      }
    });

  } else {
    res.send('something went wrong');
  }
});

module.exports = router;
