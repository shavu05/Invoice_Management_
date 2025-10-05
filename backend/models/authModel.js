const { DataTypes } = require("sequelize");
const { authDB } = require("../config/database"); // Use authDB

const User = authDB.define("User", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {                                
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "user",              
    },
    resetToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      //new tokn expritaion timestamp date.now +ttl
      resetTokenExpires: {
        type: DataTypes.BIGINT,
        allowNull: true,
      }
}, {
    timestamps: true
});

module.exports = User;
