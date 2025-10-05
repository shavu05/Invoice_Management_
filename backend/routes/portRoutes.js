const express = require('express');
const router = express.Router();
const portController = require('../controllers/portController');
const authMiddleware = require('../middleware/authMiddleware');

// newport
router.post('/', portController.createPort);

// all port geting
router.get('/', portController.getAllPorts);

// count of port
router.get('/count', portController.getPortCount);

// portbyid
router.get('/:id', portController.getPortById);

// update a port
router.put('/:id', portController.updatePort);

// delette port
router.delete('/:id', portController.deletePort);

router.get('/', authMiddleware, portController.getAllPorts);

module.exports = router;
