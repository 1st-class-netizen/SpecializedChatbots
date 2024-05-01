// This line imports React library and some specific functionalities:
// - useState: allows us to manage state (variables) within the component
// - useEffect: allows us to perform actions after the component renders
import React, { useState, useEffect } from 'react';

// This line imports axios, a library for making HTTP requests to fetch data from APIs
import axios from 'axios';

// These lines import styling components from Material UI library for creating the user interface
import { Container, Typography, Box, Button } from '@mui/material';

// This line imports Link component from Next.js for navigating between pages
import Link from 'next/link';

// This defines the structure of an Assistant object with specific properties:
interface Assistant {
  id: number;          // Unique identifier for each assistant
  name: string;        // Name of the assistant
  description: string; // Description of the assistant's capabilities
  userRole: string;    // Role or purpose of the assistant
  modelInfo: string;   // Information about the AI model used
}

// This is the main component called ListAssistants
const ListAssistants = () => {
  // useState to create variables to store:
  // - assistants: an array to hold the fetched assistant data
  // - loading: a boolean to indicate if data is being fetched
  // - error: a string to store any error message
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // useEffect hook to fetch data after the component renders:
  useEffect(() => {
    // Define an asynchronous function to fetch assistants data
    const fetchAssistants = async () => {
      try {
        // Use axios to make a GET request to the specified API endpoint
        const response = await axios.get('http://localhost:3001/assistants');
        // Update the assistants state with the fetched data
        setAssistants(response.data);
      } catch (err) {
        // If an error occurs, set the error message and log the error
        setError('Failed to fetch assistants');
        console.error(err);
      }
      // Set loading to false as data fetching is complete
      setLoading(false);
    };

    // Call the fetchAssistants function
    fetchAssistants();
  }, []); // Empty dependency array ensures the effect runs only once

  // Return the JSX code to display the content on the page
  return (
    <Container maxWidth="sm">
      {/* Display a heading for the list of assistants */}
      <Typography variant="h4" gutterBottom>
        List of AI Assistants
      </Typography>

      {/* Create a link to the CreateAssistant page */}
      <Link href="/CreateAssistant" passHref>
        <Button variant="contained" color="secondary" style={{ marginTop: '10px' }}>
          Create New Assistant
        </Button>
      </Link>

      {/* Conditionally render content based on loading and error states */}
      {loading ? (
        <Typography>Loading...</Typography> // Display loading message if data is being fetched
      ) : error ? (
        <Typography color="error">{error}</Typography> // Display error message if fetching failed
      ) : (
        // If data is fetched successfully, display the list of assistants
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
          {assistants.map((assistant) => (
            // For each assistant, create a box with details
            <Box key={assistant.id} p={2} sx={{ border: '1px solid gray', borderRadius: '4px' }}>
              {/* Display the assistant's name, description, role, and model information */}
              <Typography variant="h6">{assistant.name}</Typography>
              <Typography variant="body2">{assistant.description}</Typography>
              <Typography variant="body2">Role: {assistant.userRole}</Typography>
              <Typography variant="body2">Model: {assistant.modelInfo}</Typography>

              {/* Create a link to view details of the assistant */}
              <Link href={`/current-assistant/${assistant.id}`} passHref>
                <Button variant="outlined" color="primary" style={{ marginTop: '10px' }}>
                  View Details
                </Button>
              </Link>
            </Box>
          ))}
        </Box>
      )}
    </Container>
  );
};

// Export the ListAssistants component as the default export of the file
export default ListAssistants;