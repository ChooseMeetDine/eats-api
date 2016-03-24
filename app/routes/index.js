var router = require('express').Router();
var aglio = require('aglio');
var pollRouter = require('../routes/polls');
var restaurantRouter = require('../routes/restaurants');
var authRouter = require('../routes/auth');
var path = require('path');
var auth = require('../validators/auth');
var env = process.env.NODE_ENV || 'development';

router.get('/', function(req, res) {
  res.send('Welcome to Eats-API. Visit /docs for our documentation');
});

if (env === 'development') {
  router.use('/restaurants', restaurantRouter);
  router.use('/polls', pollRouter);
  router.get('/testauth', auth.validate, function(req, res) {
    res.send('Welcome ' + req.decoded.name +
      ' your token has been validated and your email is ' + req.decoded.email);
  });
} else {
  router.use('/polls', auth.validate, pollRouter);
  router.use('/restaurants', auth.validate, restaurantRouter);
}

router.use('/auth', authRouter);


//TODO: Fix routers for everything below this comment.

//Fake endpoint
router.get('/users', function(req, res) {
  res.json({
    name: 'Musse',
    age: 30
  });
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
