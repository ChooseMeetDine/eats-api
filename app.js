require('dotenv').config();
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var routes = require('./app/routes/index');
var bodyParser = require('body-parser');
var pollsSocket = require('./app/socketio/polls_socket');

var env = process.env.NODE_ENV || 'development';

// Enables CORS for development (to allow sites not hosted on same server to reach the API)
if (env === 'development') {
  app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use('/', routes);

// Initializes the socketIO-module for /polls
pollsSocket.init(io);

app.use(function(err, req, res, next) {
  if (!err.status) {
    err.status = 500;
  }

  res.status(err.status).send({
    httpStatus: err.status,
    error: err.message,
    stack: err.stack
  });
});

io.on('connection', function() {
  console.log('Someone connected to the API via socketIO!');
});

var port = process.env.PORT || 3000;

http.listen(port, function() {
  console.log('Eats API-server listening on port ' + port);
});

module.exports = app;
