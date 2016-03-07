var router = require('express').Router();
var aglio = require('aglio');
var pollRouter = require('../routes/polls');
var path = require('path');

router.get('/', function(req, res) {
  res.send('Welcome to Eats-API. Visit /docs for our documentation');
});

router.use('/polls', pollRouter);

//TODO: Fix routers for everything below this comment.

//Fake endpoint
router.get('/users', function(req, res) {
  res.json({
    name: 'Musse',
    age: 30
  });
});

//----------------------------------------
router.get('/', function(req, res) {
  res.send('<p>Du gick till rooten i API:et och här är env-variabeln MONGO_DB_USER i .env: ' +
    process.env.MONGO_DB_USER + '</p>');
});

router.get('/docs', function(req, res) {
  var options = {
    themeTemplate: path.join(__dirname, '../../public/aglio-theme-olio/templates/', 'index.jade'),
    locals: {
      myVariable: 125
    }
  };

  aglio.renderFile('./public/docs/README.apib', './public/docs/documentation.html', options,
    function(err, warnings) {
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


router.get('/goaldocs', function(req, res) {
  var options = {
    themeTemplate: path.join(__dirname, '../../public/aglio-theme-olio/templates/', 'index.jade'),
    themeVariables: 'default',
    locals: {
      myVariable: 125
    }
  };

  aglio.renderFile('./public/docs/GOALS.apib', './public/docs/goaldocs.html', options,
    function(err, warnings) {
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
