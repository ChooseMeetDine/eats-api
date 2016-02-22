var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var aglio = require('aglio');

app.get('/', function(req, res) {
  res.send('<p>Du gick till rooten i API:et och här är env-variabeln MONGO_DB_USER i .env: ' +
    process.env.MONGO_DB_USER + '</p>');
});

app.get('/docs', function(req, res) {
  var options = {
    themeTemplate: 'default',
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
        console.log(warnings);
      }
      res.sendFile(__dirname + '/public/docs/documentation.html');
    });
});

io.on('connection', function() {
  console.log('Someone connected to the API via socketIO!');
});

var port = process.env.PORT || 3001;

http.listen(port, function() {
  console.log('Eats API-server listening on port: ' + port);
});

module.exports = app;
