var knex = require('knex')({
  client: 'pg',
  connection: process.env.POSTGRES_CONNECTION,
  searchPath: 'knex,public',
  pool: {
    min: 1,
    max: 50
  }
});

module.exports = knex;
