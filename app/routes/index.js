var router = require('express').Router();
var pollRouter = require('../routes/polls');
var restaurantRouter = require('../routes/restaurants');
var authRouter = require('../routes/auth');
var path = require('path');
var auth = require('../validators/auth');
var env = process.env.NODE_ENV || 'development';
var access = require('../validators/access');

router.get('/', function(req, res) {
  res.send('Welcome to Eats-API. Visit /docs for our documentation');
});

if (env === 'development') {

  //Set fake user so that tokens are not needed when in dev-mode
  router.use(function(req, res, next) {
    req.validUser = {
      id: 10,
      role: 'admin'
    };
    next();
  });

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
  res.sendFile(path.join(__dirname, '../../public/docs', 'documentation.html'));
});


router.get('/goaldocs', function(req, res) {
  res.sendFile(path.join(__dirname, '../../public/docs', 'goaldocs.html'));
});


module.exports = router;
