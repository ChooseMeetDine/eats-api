//Enables starting of this script with both "node ...setup.js" and npm start
try {
  require('dotenv').config({
    silent: true
  });
} catch (err) {}
try {
  require('dotenv').config({
    path: '../.env',
    silent: true
  });
} catch (err) {}
var path = require('path');
var fs = require('fs');
var knex = require('../app/shared/database/knex');

var sql = fs.readFileSync(path.join(__dirname, '', 'inserts.sql')).toString();

knex.raw(sql)
  .then(function() {
    console.log('SUCCESS: setup.js successfully created testdata in DB');
    process.exit(0);
  })
  .catch(function(err) {
    console.log('Error in setup.js: ', err);
    process.exit(1);
  });
