const { Sequelize } = require('sequelize');
require('dotenv').config();

const schemeDB = new Sequelize(
  process.env.SCHEME_DB_NAME,
  process.env.SCHEME_DB_USER,
  process.env.SCHEME_DB_PASSWORD, 
  {
    host: process.env.SCHEME_DB_HOST,
    port: process.env.SCHEME_DB_PORT,
    dialect: 'postgres',
    logging: false,
  }
);

module.exports = schemeDB;
