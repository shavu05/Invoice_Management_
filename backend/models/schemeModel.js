const { DataTypes } = require('sequelize');
const schemeDB = require('../config/databases/schemeDB');

const Scheme = schemeDB.define('schemes', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  scheme_name: {
    type: DataTypes.STRING,
    allowNull: false,       
    unique: true             
  }
}, {
  timestamps: false,
  freezeTableName: true 
});

module.exports = Scheme;
