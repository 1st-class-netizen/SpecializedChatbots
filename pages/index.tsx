import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography, Box } from '@mui/material';

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [description, setDescription] = useState(''); // State to store the loaded description
  const [conversationHistory, setConversationHistory] = useState([]);
  const [boxHeight, setBoxHeight] = useState('300px'); // Initialize with a default value

  useEffect(() => {
    // Load the description from a text file on component mount
    fetch('/description.txt')
      .then(response => response.text())
      .then(text => setDescription(text))
      .catch(err => console.error('Failed to load description:', err));

    const updateBoxHeight = () => {
      // Estimate the total height of non-chat elements
      const estimatedOtherElementsHeight = 200; // Adjust this based on your actual UI elements outside the chat box
      const availableHeight = window.innerHeight - estimatedOtherElementsHeight;
      setBoxHeight(`${availableHeight}px`);
    };

    updateBoxHeight(); // Set initial size
    window.addEventListener('resize', updateBoxHeight); // Adjust on window resize

    return () => window.removeEventListener('resize', updateBoxHeight); // Clean up
  }, []);

  const handleSendClick = async () => {
    if (!inputText.trim()) {
      console.log("Can't send an empty message.");
      return;
    }
    
    const newRequest = { type: 'question', text: inputText };
    const updatedHistory = [...conversationHistory, newRequest];

    const requestBody = {
      contents: [
        { role: "user", parts: [{ text: description }] },
        { role: "model", parts: [{ text: "Je suis votre aide Cybercap et je répond à toutes vos questions en lien avec Cybercap." }] },
        { role: "user", parts: [{ text: inputText }] },
      ]
    };

    try {
      const apiKey = 'AIzaSyBVHf9S6j4i_w47s8bl9PO5K39dQ6bg96U';
      const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

      const response = await axios.post(`${apiUrl}?key=${apiKey}`, requestBody, {
        headers: { 'Content-Type': 'application/json' }
      });

      const parsedResponse = { type: 'response', text: response.data.candidates[0].content.parts.map(part => part.text).join(" ") };
      setConversationHistory([...updatedHistory, parsedResponse]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { type: 'response', text: "Error fetching response" };
      setConversationHistory([...updatedHistory, errorMessage]);
    } finally {
      setInputText(''); // Clear the input field after sending
    }
  };

  const chatBubbleStyle = (type) => ({
    maxWidth: '80%',
    padding: '10px',
    borderRadius: '20px',
    marginBottom: '10px',
    color: 'white',
    backgroundColor: type === 'question' ? '#90caf9' : '#a5d6a7',
    alignSelf: type === 'question' ? 'flex-start' : 'flex-end',
    wordBreak: 'break-word', // Ensure long texts wrap inside the bubble
  });

  return (
    <Container maxWidth="sm" style={{ marginTop: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Aidant Cybercap
      </Typography>
      <Box style={{ display: 'flex', flexDirection: 'column', maxHeight: boxHeight, overflowY: 'auto', backgroundColor: '#f0f0f0', padding: '10px', marginBottom: '20px', borderRadius: '5px' }}>
        {conversationHistory.map((item, index) => (
          <Box key={index} style={chatBubbleStyle(item.type)} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body1" style={{ color: '#333' }}>{item.text}</Typography>
          </Box>
        ))}
      </Box>
      <TextField
        fullWidth
        label="Votre question"
        variant="outlined"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendClick();
          }
        }}
        margin="normal"
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSendClick}
        style={{ marginBottom: '20px' }}
      >
        Envoyer
      </Button>
    </Container>
  );
}
