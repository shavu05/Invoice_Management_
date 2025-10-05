const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { checkClientExists, validateClientData } = require('../middleware/clientMiddleware');

// create clint(with validation middleware)
router.post('/', validateClientData, clientController.createClient);

// all clinet
router.get('/', clientController.getAllClients);

// coun of the clint
router.get('/count', clientController.getClientCount);

// cleint by id
router.get('/:id', checkClientExists, clientController.getClientById);

// client by ID (with validation and client check)
router.put('/:id', checkClientExists, validateClientData, clientController.updateClient);

// ]delete client by ID (with client check)
router.delete('/:id', checkClientExists, clientController.deleteClient);

module.exports = router;
