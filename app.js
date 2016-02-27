var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var routes = require('./app/routes/index');
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use('/', routes);


io.on('connection', function() {
  console.log('Someone connected to the API via socketIO!');
});

var port = process.env.PORT || 3001;

http.listen(port, function() {
  console.log('Eats API-server listening on port ' + port);
});

module.exports = app;
