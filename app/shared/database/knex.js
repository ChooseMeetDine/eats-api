var knex;

if (process.env.NODE_ENV === 'testing') {
  knex = require('knex')({
    client: 'pg',
    connection: process.env.POSTGRES_CONNECTION,
    searchPath: 'knex,testschema',
    pool: {
      min: 1,
      max: 50
    }
  });
} else {
  knex = require('knex')({
    client: 'pg',
    connection: process.env.POSTGRES_CONNECTION,
    searchPath: 'knex,public',
    pool: {
      min: 1,
      max: 50
    }
  });
}
module.exports = knex;
