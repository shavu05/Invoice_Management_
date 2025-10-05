const { Sequelize } = require("sequelize");
require("dotenv").config();


if (!process.env.DB_NAME || !process.env.DB_USER || !process.env.DB_PASS || !process.env.DB_HOST || !process.env.DB_PORT) {
    console.error("Missing auth DB environment variables");
    process.exit(1);
}


const authDB = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        dialect: "postgres",
        logging: false,
    }
);

module.exports = authDB;
