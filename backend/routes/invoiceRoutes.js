
const express = require('express');
const router = express.Router();
const { createAndDownloadInvoice } = require('../controllers/invoiceController');
const authMiddleware = require('../middleware/authMiddleware');


router.post('/', authMiddleware, createAndDownloadInvoice);

module.exports = router;