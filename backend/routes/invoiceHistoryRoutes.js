
// const express = require('express');
// const router = express.Router();
// const controller = require('../controllers/invoiceHistoryController');

// router.post('/', controller.saveInvoiceHistory);

// module.exports = router;

// const express = require('express');
// // const router = express.Router();
// const controller = require('../controllers/invoiceHistoryController');

// router.post('/', controller.saveInvoiceHistory);
// router.get('/', controller.getAllInvoices); 

// module.exports = router;



const express = require('express');
const router = express.Router();
const controller = require('../controllers/invoiceHistoryController');

// Save invoice history
router.post('/', controller.saveInvoiceHistory);

// Get all stored invoices
router.get('/', controller.getAllInvoices);

module.exports = router;



