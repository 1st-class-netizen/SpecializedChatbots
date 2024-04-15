import React, { useState } from 'react';
import { TextField, Button, Typography, Container } from '@mui/material';

function CreateAssistant() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [userRole, setUserRole] = useState('');
  const [modelInfo, setModelInfo] = useState('');

  const handleSubmit = async () => {
    const assistant = { name, description, userRole, modelInfo };
  
    try {
      const response = await fetch('http://localhost:3001/assistants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assistant),
      });
      const data = await response.json();
      console.log('Submitted successfully:', data);
    } catch (error) {
      console.error('Error submitting:', error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>Create New AI Assistant</Typography>
      <TextField fullWidth label="Name" value={name} onChange={(e) => setName(e.target.value)} margin="normal" />
      <TextField fullWidth label="Description" value={description} onChange={(e) => setDescription(e.target.value)} margin="normal" />
      <TextField fullWidth label="User Role" value={userRole} onChange={(e) => setUserRole(e.target.value)} margin="normal" />
      <TextField fullWidth label="Model Info" value={modelInfo} onChange={(e) => setModelInfo(e.target.value)} margin="normal" />
      <Button variant="contained" color="primary" onClick={handleSubmit} style={{ marginTop: '20px' }}>Create</Button>
    </Container>
  );
}

export default CreateAssistant;