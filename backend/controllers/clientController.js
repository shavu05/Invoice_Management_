const Client = require('../models/clientModel');


// Create Client
exports.createClient = async (req, res) => {
    const { company_name, address, gst_number } = req.body;

    console.log(" Received data for new client:", { company_name, address, gst_number });

    // Validation
    if (!company_name || !address || !gst_number) {
        console.warn(" Missing required fields");
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        //  GST number already exists
        const existingClient = await Client.findOne({ where: { gst_number } });

        if (existingClient) {
            return res.status(409).json({ message: 'Client with this GST number already exists' });
        }

        // Create new client if no duplicate GST number found
        const newClient = await Client.create({
            company_name,
            address,
            gst_number,
        });

        console.log('✅ Client created successfully:', newClient.dataValues);
        res.status(201).json({ message: 'Client added successfully!', client: newClient });

    } catch (error) {
        console.error('❌ Error creating client:', error);

        res.status(500).json({ message: 'Failed to create client', error: error.message });
    }
};


// Get All Clients
exports.getAllClients = async (req, res) => {
    try {
        const clients = await Client.findAll();
        res.status(200).json(clients);
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ message: 'Failed to fetch clients' });
    }
};

// Get Client Count
exports.getClientCount = async (req, res) => {
    try {
        const count = await Client.count();
        res.status(200).json({ count });
    } catch (error) {
        console.error('Error fetching client count:', error);
        res.status(500).json({ message: 'Failed to fetch client count' });
    }
};

// Get Client by ID
exports.getClientById = async (req, res) => {
    const { id } = req.params;

    try {
        const client = await Client.findByPk(id);
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.status(200).json(client);
    } catch (error) {
        console.error('Error fetching client by ID:', error);
        res.status(500).json({ message: 'Failed to fetch client' });
    }
};

// Update Client
exports.updateClient = async (req, res) => {
    const { id } = req.params;
    const { company_name, address, gst_number } = req.body;

    if (!company_name || !address || !gst_number) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const client = await Client.findByPk(id);
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        client.company_name = company_name;
        client.address = address;
        client.gst_number = gst_number;

        await client.save();
        res.status(200).json({ message: 'Client updated successfully!', client });
    } catch (error) {
        console.error('Error updating client:', error);
        res.status(500).json({ message: 'Failed to update client' });
    }
};

// Delete Client
exports.deleteClient = async (req, res) => {
    const { id } = req.params;

    try {
        const client = await Client.findByPk(id);
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        await client.destroy();
        res.status(200).json({ message: 'Client deleted successfully' });
    } catch (error) {
        console.error('Error deleting client:', error);
        res.status(500).json({ message: 'Failed to delete client' });
    }
};
