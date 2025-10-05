

const  Client = require('../models/clientModel');  

// Middleware chking clintn exists
const checkClientExists = async (req, res, next) => {
    const { id } = req.params;

    try {
        const client = await Client.findByPk(id);
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        next();  
    } catch (error) {
        console.error('Error in checkClientExists middleware:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Middleware to validate client input using forputpost
const validateClientData = (req, res, next) => {
    const { company_name, address, gst_number } = req.body;

    if (!company_name || !address || !gst_number) {
        return res.status(400).json({ message: 'All fields (company_name, address, gst_number) are required' });
    }

    next();  
};

module.exports = { checkClientExists, validateClientData };
