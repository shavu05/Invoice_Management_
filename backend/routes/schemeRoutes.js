const express = require('express');
const router = express.Router();
const schemeController = require('../controllers/schemeController');

// Define routes for schemes
router.get('/', schemeController.getAllSchemes);          //  all schemes
router.post('/', schemeController.createScheme);         //  creating a new scheme
router.get('/count', schemeController.getSchemeCount);   
router.get('/:id', schemeController.getSchemeById);      // fetching a scheme by ID
router.put('/:id', schemeController.updateScheme);       // For updating a scheme by ID
router.delete('/:id', schemeController.deleteScheme);    // For deleting a scheme by ID

module.exports = router;
