
const { Sequelize } = require('sequelize');
require('dotenv').config();

const portDB = new Sequelize(
  process.env.PORT_DB_NAME,
  process.env.PORT_DB_USER,
  process.env.PORT_DB_PASS,
  {
    host: process.env.PORT_DB_HOST,
    port: Number(process.env.PORT_DB_PORT),
    dialect: 'postgres',
    logging: false,
  }
);

module.exports = portDB;
