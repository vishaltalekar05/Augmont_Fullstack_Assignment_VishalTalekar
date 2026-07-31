const { Sequelize } = require('sequelize');
require('dotenv').config();

// Using MySQL via Sequelize. Switch dialect to 'postgres' if using PostgreSQL
// (also update DB_PORT to 5432 in .env in that case).
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = sequelize;
