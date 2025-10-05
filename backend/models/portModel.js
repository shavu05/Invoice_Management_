const { DataTypes } = require('sequelize');
const portDB = require('../config/databases/portDB'); // assuming this is where your Sequelize instance is

const Port = portDB.define('Port', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
}, {
    tableName: 'port_db', 
    timestamps: false, 
});

module.exports = Port;
