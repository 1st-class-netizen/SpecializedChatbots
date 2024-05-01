//pages/CreateAssistant.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router'; // Import useRouter
import { Container, TextField, Button, Typography } from '@mui/material';
import axios from 'axios';

const CreateAssistant = () => {
  const router = useRouter(); // Create a router instance
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [userRole, setUserRole] = useState('');
  const [modelInfo, setModelInfo] = useState('');

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:3001/assistants', {
        name,
        description,
        userRole,
        modelInfo
      });
      console.log('Assistant created:', response.data);
      // Clear fields if needed
      setName('');
      setDescription('');
      setUserRole('');
      setModelInfo('');
      // Redirect to ListAssistants after creation
      router.push('/');
    } catch (error) {
      console.error('Error creating assistant:', error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>Create New AI Assistant</Typography>
      <TextField fullWidth label="Name" value={name} onChange={e => setName(e.target.value)} margin="normal" />
      <TextField fullWidth label="Description" value={description} onChange={e => setDescription(e.target.value)} margin="normal" />
      <TextField fullWidth label="User Role" value={userRole} onChange={e => setUserRole(e.target.value)} margin="normal" />
      <TextField fullWidth label="Model Info" value={modelInfo} onChange={e => setModelInfo(e.target.value)} margin="normal" />
      <Button variant="contained" color="primary" onClick={handleSubmit} style={{ marginTop: '20px' }}>
        Create
      </Button>
      <Button variant="contained" color="primary" onClick={e => router.push('/')} style={{ marginTop: '20px' }}>
        List of Assistants
      </Button>
    </Container>
  );
};

export default CreateAssistant;
