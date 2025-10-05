const { Sequelize } = require('sequelize');
require('dotenv').config();

const clientDB = new Sequelize(
  process.env.CLIENT_DB_NAME,
  process.env.CLIENT_DB_USER,
  process.env.CLIENT_DB_PASS,
  {
    host: process.env.CLIENT_DB_HOST,
    port: process.env.CLIENT_DB_PORT,
    dialect: 'postgres',
    logging: false,
  }
);

module.exports = clientDB;
