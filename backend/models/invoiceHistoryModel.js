const { DataTypes } = require('sequelize');
const invoiceHistoryDB = require('../config/databases/invoiceHistoryDB');

const InvoiceHistory = invoiceHistoryDB.define('InvoiceHistory', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  client_id: { type: DataTypes.INTEGER, allowNull: false },
  client_name: { type: DataTypes.STRING, allowNull: false },
  client_gst: { type: DataTypes.STRING },
  client_address: { type: DataTypes.TEXT },
  invoice_number: { type: DataTypes.STRING, allowNull: false },
  invoice_date: { type: DataTypes.DATEONLY, allowNull: false },
  hsn_code: { type: DataTypes.STRING, allowNull: false },
  items: { type: DataTypes.JSONB, allowNull: false },
  subtotal: { type: DataTypes.FLOAT, allowNull: false },
  cgst: { type: DataTypes.FLOAT },
  sgst: { type: DataTypes.FLOAT },
  igst: { type: DataTypes.FLOAT },
  total: { type: DataTypes.FLOAT, allowNull: false },
  amount_in_words: { type: DataTypes.TEXT }
}, {
  tableName: 'invoice_history',
  timestamps: false,
});

module.exports = InvoiceHistory;



