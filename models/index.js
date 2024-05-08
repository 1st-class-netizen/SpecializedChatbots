//models/index.js
/**
 * This module sets up the database configuration for our application using Sequelize, an ORM (Object-Relational Mapper) library.
 * It allows us to define models in JavaScript and map them to database tables, and then interact with these tables like objects.
 * Here, we are using SQLite as our database, which stores data in a single file on your computer.
 *
 * In this file, we:
 * - Configure Sequelize to connect to a SQLite database.
 * - Define a model 'Assistant' that represents a table in our database.
 * - Initialize the database and ensure that the model's table is created.
 * 
 * This approach encapsulates database setup and model definitions in one place, making it easier to manage data structure and database interactions.
 * Understanding this setup is crucial for backend development, as it directly handles how data is stored and managed in web applications.
 */
// Import necessary libraries:
// - Sequelize: for interacting with the database
// - DataTypes: for defining data types for database columns
const { Sequelize, DataTypes } = require('sequelize');

// Create a new Sequelize instance, configuring it to use SQLite as the database engine.
const sequelize = new Sequelize({
  dialect: 'sqlite',                  // Specify the type of database (SQLite in this case)
  storage: './database.sqlite' // Specify the location and name of the database file, define the file that will act as the SQLite database.
});

// Define the 'Assistant' model with its structure as it will appear in the database.
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