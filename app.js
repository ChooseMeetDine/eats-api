var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var routes = require('./app/routes/index');
var bodyParser = require('body-parser');

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

app.use(function(err, req, res, next) {
  res.status(500).send({
    httpStatus: 500,
    error: err.message,
    stack: err.stack
  });
});

io.on('connection', function() {
  console.log('Someone connected to the API via socketIO!');
});

var port = process.env.PORT || 3001;

http.listen(port, function() {
  console.log('Eats API-server listening on port ' + port);
});

module.exports = app;
