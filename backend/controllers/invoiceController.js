
const { createInvoice } = require('../models/invoiceModel');
const { generateInvoicePDF } = require('../utils/pdfGenerator');

async function createAndDownloadInvoice(req, res) {
  try {
    const invoiceData = req.body;
    // Basic validation
    if (
      !invoiceData.invoice_number ||
      !invoiceData.client_name ||
      !invoiceData.client_address ||
      !invoiceData.invoice_date ||
      !invoiceData.items ||
      invoiceData.items.length === 0
    ) {
      return res.status(400).json({ message: 'Missing required invoice data.' });
    }
    
    // Save invoice to DB 
    const invoiceId = await createInvoice(invoiceData); 
    
    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(invoiceData);
    
    // Send PDF as response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice_${invoiceData.invoice_number}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error creating and downloading invoice:', error);
    res.status(500).json({ message: 'Failed to create and download invoice.' });
  }
}

module.exports = { createAndDownloadInvoice };