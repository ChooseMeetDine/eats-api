var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var routes = require('./app/routes/index');
var bodyParser = require('body-parser');
var pollsSocket = require('./app/socketio/polls_socket');

// redirects to HTTPS on Heroku (http://jaketrent.com/post/https-redirect-node-heroku/)
var env = process.env.NODE_ENV || 'development';
if (env === 'production') {
  app.use(function(req, res, next) {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, 'https://' + (req.header('host')) + req.url);
    } else {
      return next();
    }
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
  res.status(500).send({
    httpStatus: 500,
    error: err.message,
    stack: err.stack
  });
});

app.get('/login', function(req, res) {
  res.sendFile(__dirname + '/public/login/index.html');
});

var port = process.env.PORT || 3001;

http.listen(port, function() {
  console.log('Eats API-server listening on port ' + port);
});

module.exports = app;
