var router = require('express').Router();
var pollRouter = require('../routes/polls');
var restaurantRouter = require('../routes/restaurants');
var authRouter = require('../routes/auth');
var path = require('path');
var auth = require('../validators/auth');
//var authTest = require('../routes/authTest'); Route for testing auth


router.get('/', function(req, res) {
  res.send('Welcome to Eats-API. Visit /docs for our documentation');
});

router.get('/testauth', auth.validate, function(req, res) {
  res.send('Welcome ' + req.decoded.name +
    ' your token has been validated and your email is ' + req.decoded.email);
});

router.use('/polls', pollRouter);
router.use('/restaurants', restaurantRouter);
router.use('/auth', authRouter);
//router.use('/authtest', auth.validate, authTest); Route for testing auth

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
  res.sendFile(path.join(__dirname, '../../public/docs', 'documentation.html'));
});


router.get('/goaldocs', function(req, res) {
  res.sendFile(path.join(__dirname, '../../public/docs', 'goaldocs.html'));
});


module.exports = router;
