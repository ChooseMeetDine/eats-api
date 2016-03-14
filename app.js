var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var routes = require('./app/routes/index');
var bodyParser = require('body-parser');
var pollsSocket = require('./app/socketio/polls_socket');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use('/', routes);

// Initializes the socketIO-module for /polls
pollsSocket.init(io);

var port = process.env.PORT || 3001;

http.listen(port, function() {
  console.log('Eats API-server listening on port ' + port);
});

module.exports = app;
