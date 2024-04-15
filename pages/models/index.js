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

// Export the model
module.exports = { sequelize, Assistant };
