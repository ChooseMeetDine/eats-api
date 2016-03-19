var router = require('express').Router();
var pollRouter = require('../routes/polls');
var authRouter = require('../routes/auth');
var path = require('path');
var auth = require('../validators/auth');
var socketio = require('../socketio/polls_socket');
var knex = require('../shared/database/knex');
//var authTest = require('../routes/authTest'); Route for testing auth

router.get('/', function(req, res) {
  res.send('Welcome to Eats-API. Visit /docs for our documentation');
});

// Dummy route for testing socketio
// Appends the name of pollid 15 with ' UPDATE' and sends new poll
// data via socketio to any listeners for that pollid
// Created a client on the spike repo (/public/index.html) to use in the test
router.get('/socketiotest', function(req, res) {
  knex('poll').pluck('name').where('id', '15')
    .then(function(result) {
      return knex('poll')
        .update({
          name: result[0] + ' UPDATE'
        }).where('id', '15')
        .returning('name')
        .then(function(result) {
          console.log('Updated name for pollid 15 with: ' + result);
          console.log('Sending new poll data via socketio');
          socketio.fetchAndSendNewPollData(15);
          res.send('Updated name for pollid 15 with: "' + result[0] +
            '" -- Sending new poll data via socketio');
        });
    })
    .catch(function(error) {
      console.log(error);
      res.send(error);
    });
});

router.get('/testauth', auth.validate, function(req, res) {
  res.send('Welcome ' + req.decoded.name +
    ' your token has been validated and your email is ' + req.decoded.email);
});

router.use('/polls', pollRouter);
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
