import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Box } from '@mui/material';

interface Assistant {
  id: number;
  name: string;
  description: string;
  userRole: string;
  modelInfo: string;
}

const ListAssistants = () => {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchAssistants = async () => {
      try {
        const response = await axios.get('http://localhost:3001/assistants');
        setAssistants(response.data);
      } catch (err) {
        setError('Failed to fetch assistants');
        console.error(err);
      }
      setLoading(false);
    };
    fetchAssistants();
  }, []);

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        List of AI Assistants
      </Typography>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
          {assistants.map((assistant) => (
            <Box key={assistant.id} p={2} sx={{ border: '1px solid gray', borderRadius: '4px' }}>
              <Typography variant="h6">{assistant.name}</Typography>
              <Typography variant="body2">{assistant.description}</Typography>
              <Typography variant="body2">Role: {assistant.userRole}</Typography>
              <Typography variant="body2">Model: {assistant.modelInfo}</Typography>
            </Box>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default ListAssistants;
