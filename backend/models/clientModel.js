const { DataTypes } = require('sequelize');
const clientDB = require('../config/databases/clientDB');

const Client = clientDB.define('Client', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    company_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    gst_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
}, {
    tableName: 'clients',
    timestamps: false,
});

module.exports = Client;
