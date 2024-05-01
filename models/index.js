// Import necessary libraries:
// - Sequelize: for interacting with the database
// - DataTypes: for defining data types for database columns
const { Sequelize, DataTypes } = require('sequelize');

// Create a new Sequelize instance to connect to a SQLite database
const sequelize = new Sequelize({
  dialect: 'sqlite',                  // Specify the type of database (SQLite in this case)
  storage: './database.sqlite' // Specify the location and name of the database file
});

// Define a model called "Assistant" to represent assistants in the database
const Assistant = sequelize.define('Assistant', {
  // Define the structure of the Assistant model with columns and their data types
  name: DataTypes.STRING,        // Column for storing the assistant's name (as text) 
  description: DataTypes.STRING, // Column for storing the assistant's description (as text)
  userRole: DataTypes.STRING,    // Column for storing the assistant's role (as text)
  modelInfo: DataTypes.STRING,   // Column for storing information about the AI model (as text)
}, { timestamps: false }); // Disable timestamps (createdAt and updatedAt columns) for this model

/*
  This comment explains the behavior of sequelize.sync()
  - sequelize.sync({ force: true }) would recreate database tables on each application start (useful for development but dangerous for production)
  - sequelize.sync() (without force: true) will only create tables if they don't already exist (safer for production)
*/
// Synchronize the model with the database, creating the table if it doesn't exist
sequelize.sync().then(() => console.log('Database is ready and tables created.'));

// Export the Assistant model to make it available for use in other parts of the application
module.exports = { Assistant };