import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Box, Button, Switch } from '@mui/material';
import Link from 'next/link';
import { useTheme } from '../contexts/ThemeContext'; // Adjust the path as necessary

const ListAssistants = () => {
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { toggleTheme, themeMode } = useTheme(); // Added themeMode to context to manage current theme state

  useEffect(() => {
    const fetchAssistants = async () => {
      try {
        const response = await axios.get('http://localhost:3001/assistants');
        setAssistants(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch assistants');
        console.error(err);
        setLoading(false);
      }
    };

    fetchAssistants();
  }, []);

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        List of AI Assistants
      </Typography>

      {/* Theme toggle switch */}
      <Switch
        checked={themeMode === 'dark'} // Use context to get current theme mode
        onChange={toggleTheme}
        color="default"
      />

      <Link href="/CreateAssistant" passHref>
        <Button variant="contained" color="secondary" style={{ marginTop: '10px' }}>
          Create New Assistant
        </Button>
      </Link>

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

export default ListAssistants;
