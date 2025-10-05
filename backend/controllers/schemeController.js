const Scheme = require('../models/schemeModel');
const { Op } = require('sequelize');

// GET all schemes
exports.getAllSchemes = async (req, res) => {
  try {
    const schemes = await Scheme.findAll();
    res.json(schemes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET one scheme by ID
exports.getSchemeById = async (req, res) => {
  try {
    const scheme = await Scheme.findByPk(req.params.id);
    if (!scheme) return res.status(404).json({ error: 'Scheme not found' });
    res.json(scheme);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE a new scheme
exports.createScheme = async (req, res) => {
  try {
    const { scheme_name } = req.body;

    // Validation: Empty name
    if (!scheme_name || scheme_name.trim() === '') {
      return res.status(400).json({ error: 'Scheme name is required' });
    }

    // Validation: Duplicate name
    const existing = await Scheme.findOne({ where: { scheme_name } });
    if (existing) {
      return res.status(409).json({ error: 'Scheme already exists' });
    }

    const scheme = await Scheme.create({ scheme_name });
    res.status(201).json(scheme);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE scheme by ID
exports.updateScheme = async (req, res) => {
    try {
      const { scheme_name } = req.body;
  
      // Validation: Empty name
      if (!scheme_name || scheme_name.trim() === '') {
        return res.status(400).json({ error: 'Scheme name is required' });
      }
  
      const scheme = await Scheme.findByPk(req.params.id);
      if (!scheme) return res.status(404).json({ error: 'Scheme not found' });
  
      // Validation: Duplicate name (excluding current ID)
      const existing = await Scheme.findOne({ 
        where: {
          scheme_name,
          id: { [Op.ne]: req.params.id }  // Exclude current ID
        }
      });
  
      if (existing) {
        return res.status(409).json({ error: 'Another scheme with the same name already exists' });
      }
  
      // Update and save
      scheme.scheme_name = scheme_name;
      await scheme.save();
  
      res.json(scheme);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  

// DELETE scheme by ID
exports.deleteScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findByPk(req.params.id);
    if (!scheme) return res.status(404).json({ error: 'Scheme not found' });

    await scheme.destroy();
    res.json({ message: 'Scheme deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Get scheme count
exports.getSchemeCount = async (req, res) => {
  try {
    const totalSchemes = await Scheme.count(); 
    res.json({ count: totalSchemes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
