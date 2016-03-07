var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var aglio = require('aglio');
var stormpath = require('express-stormpath');
var knex = require('./app/shared/knex');

app.use(stormpath.init(app, {
  website: true
}));

//Fake endpoint
app.get('/users', function (req, res) {
  res.json({
    name: 'Musse',
    age: 30
  });
});

app.get('/loggaut', stormpath.getUser, function (req, res) {
  if (req.user) {
    res.sendFile(__dirname + '/public/loggaut.html');
  } else {
    res.send('Not logged in');
  }
});

//----------------------------------------
app.get('/', stormpath.getUser, function (req, res) {
  if (req.user) {
    //res.send('Hello, ' + req.user.email);
    knex.select('email').from('user').where('email', '=', req.user.email)
      .then(function (result) {
        res.send(result);
      }).catch(function (error) {
        res.send(error);
      });
  } else {
    res.send('<p>Du gick till rooten i API:et och här är env-variabeln MONGO_DB_USER i .env: ' +
      process.env.MONGO_DB_USER + '</p>');
  }
});

app.get('/docs', function (req, res) {
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
      res.sendFile(__dirname + '/public/docs/documentation.html');
    });
});


app.get('/goaldocs', function (req, res) {
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
      res.sendFile(__dirname + '/public/docs/goaldocs.html');
    });
});

io.on('connection', function () {
  console.log('Someone connected to the API via socketIO!');
});

var port = process.env.PORT || 3001;

http.listen(port, function () {
  console.log('Eats API-server listening on port ' + port);
});

module.exports = app;
