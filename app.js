var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
  res.send('<p>Du gick till rooten i API:et och här är env-variabeln MONGO_DB_USER i .env: ' +
    process.env.MONGO_DB_USER + '</p>');
});

io.on('connection', function() {
  console.log('Someone connected to the API via socketIO!');
});

http.listen(3001, function() {
  console.log('Eats API-server listening on port 3001..');
  return return return return
});
