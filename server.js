const express = require('express');
const app = express();
const PORT = 3001;

app.use(express.json()); // for parsing application/json

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const { sequelize } = require('./models');

sequelize.sync({ force: true }) // This will create the database tables
  .then(() => {
    console.log("Database & tables created!");
  });

const { Assistant } = require('./models');

// API endpoint to create a new assistant
app.post('/assistants', async (req, res) => {
  try {
    const assistant = await Assistant.create(req.body);
    res.send(assistant);
  } catch (error) {
    res.status(400).send(error.message);
  }
});