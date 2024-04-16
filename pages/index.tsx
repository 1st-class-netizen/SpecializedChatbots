import React, { useState, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography, Box } from '@mui/material';

interface ChatBubble {
  type: 'question' | 'response';
  text: string;
}

const Home: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [conversationHistory, setConversationHistory] = useState<ChatBubble[]>([]);
  const [boxHeight, setBoxHeight] = useState<string>('300px');

  useEffect(() => {
    fetch('/description.txt')
      .then(response => response.text())
      .then(text => setDescription(text))
      .catch(err => console.error('Failed to load description:', err));

    const updateBoxHeight = () => {
      const estimatedOtherElementsHeight = 200;
      const availableHeight = window.innerHeight - estimatedOtherElementsHeight;
      setBoxHeight(`${availableHeight}px`);
    };

    updateBoxHeight();
    window.addEventListener('resize', updateBoxHeight);

    return () => window.removeEventListener('resize', updateBoxHeight);
  }, []);

  const handleSendClick = async () => {
    if (!inputText.trim()) {
      console.log("Can't send an empty message.");
      return;
    }

    const newRequest: ChatBubble = { type: 'question', text: inputText };
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

      const parsedResponse: ChatBubble = { type: 'response', text: response.data.candidates[0].content.parts.map((part: any) => part.text).join(" ") };
      setConversationHistory([...updatedHistory, parsedResponse]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: ChatBubble = { type: 'response', text: "Error fetching response" };
      setConversationHistory([...updatedHistory, errorMessage]);
    } finally {
      setInputText(''); // Clear the input field after sending
    }
  };

  const chatBubbleStyle = (type: 'question' | 'response') => ({
    maxWidth: '80%',
    padding: '10px',
    borderRadius: '20px',
    marginBottom: '10px',
    color: 'white',
    backgroundColor: type === 'question' ? '#90caf9' : '#a5d6a7',
    alignSelf: type === 'question' ? 'flex-start' : 'flex-end',
    wordBreak: 'break-word',
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
        onChange={(e: ChangeEvent<HTMLInputElement>) => setInputText(e.target.value)}
        onKeyDown={(e: KeyboardEvent) => {
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

export default Home;
