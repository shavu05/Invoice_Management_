require('dotenv').config();
const { Sequelize } = require('sequelize');  // ✅ this is necessary


const invoiceHistoryDB = new Sequelize(
  process.env.INVOICE_HISTORY_DB_NAME,
  process.env.INVOICE_HISTORY_DB_USER,
  process.env.INVOICE_HISTORY_DB_PASS,
  {
    host: process.env.INVOICE_HISTORY_DB_HOST,
    port: process.env.INVOICE_HISTORY_DB_PORT,
    dialect: 'postgres',
    logging: false,
  }
);

module.exports = invoiceHistoryDB;