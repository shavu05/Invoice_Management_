const { Op } = require('sequelize');
const Port    = require('../models/portModel');

// GET /api/ports?search=…
exports.getAllPorts = async (req, res) => {
  try {
    const ports = await Port.findAll({
      where: {
        name: { [Op.iLike]: `%${req.query.search || ''}%` }
      },
      order: [['id','ASC']]
    });
    res.json(ports);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching ports', error: err.message });
  }
};

// GET by ID
exports.getPortById = async (req, res) => {
  const port = await Port.findByPk(req.params.id);
  if (!port) return res.status(404).json({ message: 'Port not found' });
  res.json(port);
};

// POST
exports.createPort = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Port name is required' });
  const newPort = await Port.create({ name });
  res.status(201).json(newPort);
};

// PUT
exports.updatePort = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Port name is required' });
  const port = await Port.findByPk(req.params.id);
  if (!port) return res.status(404).json({ message: 'Port not found' });
  port.name = name;
  await port.save();
  res.json(port);
};

// DELETE
exports.deletePort = async (req, res) => {
  const port = await Port.findByPk(req.params.id);
  if (!port) return res.status(404).json({ message: 'Port not found' });
  await port.destroy();
  res.json({ message: 'Port deleted' });
};

// Get total ports count

exports.getPortCount = async (req, res) => {
  try {
      const count = await Port.count();
      res.json({ count });
  } catch (error) {
      console.error('Error fetching port count:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
};
