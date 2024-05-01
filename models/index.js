//models/index.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite' // This will create a SQLite database file in your project directory
});

// Define a model
const Assistant = sequelize.define('Assistant', {
  name: DataTypes.STRING,
  description: DataTypes.STRING,
  userRole: DataTypes.STRING,
  modelInfo: DataTypes.STRING,
}, { timestamps: false });

/* 
Your sequelize.sync({ force: true }) will force the database to recreate the tables every time the application 
starts, which is useful for development but should be removed or changed to sequelize.sync() for production to avoid losing data.
*/

sequelize.sync().then(() => console.log('Database is ready and tables created.'));

module.exports = { Assistant };
