import React, { useState, useEffect } from 'react';
import { Container, Typography, List, ListItem, ListItemText } from '@mui/material';

function ListAssistants() {
  const [assistants, setAssistants] = useState([]);

  useEffect(() => {
    // Mock fetch data
    const fetchData = async () => {
      // Simulating fetching data
      const data = [
        { id: 1, name: 'Assistant 1', description: 'Description 1' },
        { id: 2, name: 'Assistant 2', description: 'Description 2' },
      ];
      setAssistants(data);
    };

    fetchData();
  }, []);

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>List of AI Assistants</Typography>
      <List>
        {assistants.map((assistant) => (
          <ListItem key={assistant.id} button>
            <ListItemText primary={assistant.name} secondary={assistant.description} />
          </ListItem>
        ))}
      </List>
    </Container>
  );
}

export default ListAssistants;
