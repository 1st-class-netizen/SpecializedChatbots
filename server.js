//server.js
/**
 * This Node.js server is built using the Express.js framework, which simplifies the handling of incoming HTTP requests
 * and interactions with a database. The server is designed to manage data about "assistants" – entities that could represent
 * software bots, virtual assistants, or any entity that requires storing and retrieving structured data. Here's how it works:
 * - The server sets up endpoints (URL paths) that listen for HTTP requests (like GET or POST) to perform CRUD operations—Create, Read, Update, Delete—on the assistant data.
 * - It uses middleware like 'express.json()' to parse incoming request bodies and 'cors()' to allow the server to accept requests from web pages not hosted on the same domain.
 * - The 'Assistant' model, presumed to be defined using an ORM (Object-Relational Mapping) like Sequelize, handles the interaction with a database table that stores the assistants' data.
 * - Routes are defined to create a new assistant, fetch all assistants, or retrieve/update a specific assistant by ID. These routes respond with JSON data and handle errors appropriately.
 * - This setup exemplifies a typical backend application providing an API (Application Programming Interface) that could be consumed by frontend applications or other services.
 * 
 * Each part of the code is annotated to help beginners understand what it does and how it contributes to the server's functionality.
 */

// Import necessary libraries:
// - express: for creating a web server and handling HTTP requests
// - Assistant: a model representing assistants in the database (presumably defined elsewhere)
// - cors: for enabling Cross-Origin Resource Sharing (allows requests from different origins)
const express = require('express');
const { Assistant } = require('./models');
const cors = require('cors');

// Create an instance of the Express app
const app = express();

// Set the port for the server to listen on (either from environment variable or default 3001)
const port = process.env.PORT || 3001;

// Enable CORS so that this API can be accessed from web-pages hosted on other domains
app.use(cors());

// Enable parsing JSON data in the request body, essential for receiving data through POST or PUT requests
app.use(express.json());

// Define a route to handle POST requests to create a new assistant
// POST route to create a new assistant in the database
app.post('/assistants', async (req, res) => {
  try {
    // Extract the assistant data from the request body
    const { name, description, userRole, modelInfo } = req.body;
    // Create a new assistant record in the database using the Assistant model
    const assistant = await Assistant.create({ name, description, userRole, modelInfo });
    // Respond with the newly created assistant data and a 201 status code indicating that something was created
    res.status(201).json(assistant);
  } catch (error) {
    // Log the error and respond with a 500 internal server error status code
    console.error('Failed to create assistant:', error);
    // Send a response with an error message and a 500 Internal Server Error status code
    res.status(500).json({ error: error.message });
  }
});

// Define a route to handle GET requests to retrieve all assistants from the database
app.get('/assistants', async (req, res) => {
  try {
    // Retrieve all assistants from the database using the Assistant model
    const assistants = await Assistant.findAll();
    // Send a response with the list of assistants as JSON
    res.json(assistants);
  } catch (error) {
    // Log any errors that occur during retrieval
    console.error('Failed to retrieve assistants:', error);
    // Send a response with an error message and a 500 Internal Server Error status code
    res.status(500).json({ error: error.message });
  }
});

// Define a route to handle GET requests to retrieve a specific assistant by ID
app.get('/assistants/:id', async (req, res) => {
  try {
    // Extract the assistant ID from the request parameters
    const id = req.params.id;
    // Find the assistant with the matching ID in the database, find a single record by its primary key (PK) with the findByPk method
    const assistant = await Assistant.findByPk(id);
    // If the assistant is not found, send a 404 Not Found response
    if (!assistant) {
      return res.status(404).json({ error: 'Assistant not found' });
    }
    // Send a response with the assistant data as JSON
    res.json(assistant); 
  } catch (error) {
    // Log any errors that occur during retrieval
    console.error('Failed to retrieve assistant details:', error);
    // Send a response with an error message and a 500 Internal Server Error status code
    res.status(500).json({ error: error.message }); 
  }
});

// Start the server and listen for incoming requests on the specified port
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`); // Log a message to the console indicating the server is running and on which port
});