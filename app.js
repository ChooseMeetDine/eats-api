// Enables HTTP traffic monitoring for PM2 and Keymetrics.io
var pmx = require('pmx');
pmx.init({
  http: true
});

require('dotenv').config();
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var routes = require('./app/routes/index');
var bodyParser = require('body-parser');
var pollsSocket = require('./app/socketio/polls_socket');

var env = process.env.NODE_ENV || 'development';

// Enables CORS for development (to allow sites not hosted on same server to reach the API)
// if (env === 'development') {   // TODO: Sätt på CORS för production när vi gör vår överlämning!
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, accept, x-access-token');

  // To allow the OPTIONS-method that browsers send to get a 200 OK without token
  if (req.method === 'OPTIONS') {
    res.send();
  } else  {
    next();
  }
});
// }

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use('/', routes);

// Initializes the socketIO-module for /polls
pollsSocket.init(io);

// Enables express-errors to be handled by pmx (and PM2/Keymetrics)
app.use(pmx.expressErrorHandler());

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


var port;
if (process.env.NODE_ENV === 'testing') {
  // Use strange port when running system tests (which start its own instance off the API)
  port = 9999;
} else {
  // .. otherwise set according to env
  port = process.env.PORT || 3000;
}

http.listen(port, function() {
  console.log('Eats API-server listening on port ' + port);
});

module.exports = app;
