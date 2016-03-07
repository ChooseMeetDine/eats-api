var router = require('express').Router();
var aglio = require('aglio');
var pollRouter = require('../routes/polls');
var path = require('path');
var knex = require('../shared/knex');
var stormpath = require('express-stormpath');



router.use('/polls', pollRouter);

//TODO: Fix routers for everything below this comment.

//Fake endpoint
router.get('/users', function (req, res) {
  res.json({
    name: 'Musse',
    age: 30
  });
});

router.get('/log-out', stormpath.getUser, function (req, res) {
  if (req.user) {
    res.sendFile(__dirname + '/loggaut.html');
  } else {
    res.send('Not logged in');
  }
});

router.get('/admin', stormpath.groupsRequired(['admin']), function (req, res) {
  res.send('Welcome admin');
});

//----------------------------------------
router.get('/', stormpath.getUser, function (req, res) {
  if (req.user) {
    knex.select('*').from('user').where('email', '=', req.user.email)
      .then(function (result) {
        res.send('Welcome ' + result[0].name);
      }).catch(function (error) {
        res.send(error);
      });
  } else {
    res.send('<p>Du gick till rooten i API:et och här är env-variabeln MONGO_DB_USER i .env: ' +
      process.env.MONGO_DB_USER + '</p>');
  }
});


//----------------------------------------
router.get('/', function (req, res) {
  res.send('<p>Du gick till rooten i API:et och här är env-variabeln MONGO_DB_USER i .env: ' +
    process.env.MONGO_DB_USER + '</p>');
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


module.exports = router;
