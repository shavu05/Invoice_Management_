
const InvoiceHistory = require('../models/invoiceHistoryModel');

exports.saveInvoiceHistory = async (req, res) => {
  try {
    const data = req.body;
    const saved = await InvoiceHistory.create(data);
    res.status(201).json({ message: 'Invoice history saved successfully', data: saved });
  } catch (error) {
    console.error('Error saving invoice history:', error);
    res.status(500).json({ message: 'Failed to save invoice history' });
  }
};

exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await InvoiceHistory.findAll({ order: [['id', 'DESC']] });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch invoice history' });
  }
};
