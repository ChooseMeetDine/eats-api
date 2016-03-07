var knex = require('knex')({
  client: 'pg',
  connection: {
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASS,
    database: process.env.POSTGRES_DB,
    port: process.env.POSTGRES_PORT,
    host: process.env.POSTGRES_HOST,
    ssl: true
  },
  searchPath: 'knex,public',
  pool: {
    min: 1,
    max: 50
  }
});

module.exports = knex;
