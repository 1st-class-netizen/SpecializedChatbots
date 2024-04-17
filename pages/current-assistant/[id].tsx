// pages/current-assistant/[id].tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Container, Typography, Box } from '@mui/material';

const CurrentAssistant = () => {
  const router = useRouter();
  const { id } = router.query;

  const [assistant, setAssistant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      const fetchAssistant = async () => {
        try {
          const response = await axios.get(`http://localhost:3001/assistants/${id}`);
          setAssistant(response.data);
        } catch (err) {
          setError('Failed to fetch assistant details');
          console.error(err);
        }
        setLoading(false);
      };
      fetchAssistant();
    }
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Assistant Details
      </Typography>
      {assistant && (
        <Box>
          <Typography variant="h5">{assistant.name}</Typography>
          <Typography variant="subtitle1">{assistant.description}</Typography>
          <Typography variant="body1">Role: {assistant.userRole}</Typography>
          <Typography variant="body1">Model Info: {assistant.modelInfo}</Typography>
        </Box>
      )}
    </Container>
  );
};

export default CurrentAssistant;
