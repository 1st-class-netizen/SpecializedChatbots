//pages/CreateAssistant.tsx

/**
 * The CreateAssistant component is designed for creating new AI Assistant entries.
 * This component demonstrates form handling, state management, and navigation in a React application using Material-UI for styling.
 * Users can input details about a new AI assistant, which are then submitted to a backend server via an API call.
 * This page is particularly useful for understanding basic React concepts like component structure, hooks for managing state and effects,
 * event handling, and using external libraries (axios for API calls and Material-UI for design).
 */

// Import necessary libraries:
// - React: for building user interfaces
// - useState: for managing state within the component
// - useRouter: for navigating between pages in Next.js
// - Material UI components: for styling the interface
// - axios: for making HTTP requests to interact with the backend API
import React, { useState } from 'react';
import { useRouter } from 'next/router'; 
import { Container, TextField, Button, Typography } from '@mui/material';
import axios from 'axios';

// Define the main component called CreateAssistant
const CreateAssistant = () => {
  // Create a router instance to handle navigation
  const router = useRouter(); 

  // Use useState to create variables for storing user input:
  // - name: stores the assistant's name
  // - description: stores the assistant's description
  // - userRole: stores the assistant's role or purpose
  // - modelInfo: stores information about the AI model used
  const [name, setName] = useState(''); 
  const [description, setDescription] = useState('');
  const [userRole, setUserRole] = useState('');
  const [modelInfo, setModelInfo] = useState(''); 

  // This function handles the form submission when the "Create" button is clicked
  const handleSubmit = async () => { 
    // Try to send a POST request to the API to create a new assistant
    try {
      const response = await axios.post('http://localhost:3001/assistants', { 
        name,        // Include the user input values in the request
        description,
        userRole,
        modelInfo
      });

      // Log the response data (the newly created assistant) to the console
      console.log('Assistant created:', response.data); 

      // Clear the input fields after successful creation
      setName('');    
      setDescription('');
      setUserRole(''); 
      setModelInfo('');

      // Redirect the user to the ListAssistants page after creating the assistant
      router.push('/'); 
    } catch (error) {
      // Log any errors that occur during the process
      console.error('Error creating assistant:', error); 
    }
  };

  // This part defines the user interface of the component
  return (
    <Container maxWidth="sm"> 
      {/* Display a heading for the page */}
      <Typography variant="h4" gutterBottom>Create New AI Assistant</Typography>

      {/* Create text fields for user input: */}
      {/* Each field has a label, value, and onChange handler to update the corresponding state variable */}
      <TextField fullWidth label="Name" value={name} onChange={e => setName(e.target.value)} margin="normal" /> 
      <TextField fullWidth label="Description" value={description} onChange={e => setDescription(e.target.value)} margin="normal" />       
      <TextField fullWidth label="User Role" value={userRole} onChange={e => setUserRole(e.target.value)} margin="normal" />       
      <TextField fullWidth label="Model Info" value={modelInfo} onChange={e => setModelInfo(e.target.value)} margin="normal" />       

      {/* Create buttons for submitting the form and navigating to the list of assistants */}
      <Button variant="contained" color="primary" onClick={handleSubmit} style={{ marginTop: '20px' }}> 
        Create
      </Button>
      <Button variant="contained" color="primary" onClick={e => router.push('/')} style={{ marginTop: '20px' }}> 
        List of Assistants
      </Button>
    </Container>
  );
};

// Export the CreateAssistant component for use in other parts of the application
export default CreateAssistant;