const express = require('express');
const { Assistant } = require('./models');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;  // Use environment variable for port

app.use(cors());
app.use(express.json());  // Using built-in Express JSON parser

app.post('/assistants', async (req, res) => {
  try {
    const { name, description, userRole, modelInfo } = req.body;
    const assistant = await Assistant.create({ name, description, userRole, modelInfo });
    res.status(201).json(assistant);  // Send back a 201 status code for resource creation
  } catch (error) {
    console.error('Failed to create assistant:', error);
    res.status(500).json({ error: error.message });  // Provide error message in response
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
