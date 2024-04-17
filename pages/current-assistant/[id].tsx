// pages/current-assistant/[id].tsx
import React, { useEffect, useState, ChangeEvent, KeyboardEvent } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Container, TextField, Button, Typography, Box } from '@mui/material';
import Link from 'next/link';

interface Assistant {
  id: number;
  name: string;
  description: string;
  userRole: string;
  modelInfo: string;
}

interface ChatBubble {
  type: 'question' | 'response';
  text: string;
}

const CurrentAssistant = () => {
  const router = useRouter();
  const { id } = router.query;

  const [assistant, setAssistant] = useState<Assistant | null>(null);
  const [inputText, setInputText] = useState<string>('');
  const [conversationHistory, setConversationHistory] = useState<ChatBubble[]>([]);
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

  const handleSendClick = async () => {
    if (!inputText.trim()) {
      console.log("Can't send an empty message.");
      return;
    }

    const newRequest: ChatBubble = { type: 'question', text: inputText };
    const updatedHistory = [...conversationHistory, newRequest];

    const requestBody = {
      contents: [
        { role: "user", parts: [{ text: assistant?.userRole || '' }] },
        { role: "model", parts: [{ text: assistant?.modelInfo || "Default response from assistant" }] },
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Assistant Details - {assistant?.name}
      </Typography>
      {assistant && (
        <Box>
          <Typography variant="h5">{assistant.name}</Typography>
          <Typography variant="subtitle1">{assistant.description}</Typography>
          <Typography variant="body1">Role: {assistant.userRole}</Typography>
          <Typography variant="body1">Model Info: {assistant.modelInfo}</Typography>
          {conversationHistory.map((bubble, index) => (
            <Box key={index} style={{ padding: '10px', border: '1px solid black', margin: '10px 0' }}>
              <Typography color={bubble.type === 'question' ? "primary" : "secondary"}>{bubble.text}</Typography>
            </Box>
          ))}
          <TextField
            fullWidth
            label="Your question"
            variant="outlined"
            value={inputText}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setInputText(e.target.value)}
            onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
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
            Send
          </Button>
          <Link href="/ListAssistants" passHref>
            <Button variant="contained" color="secondary" style={{ marginTop: '10px' }}>
              Back to List
            </Button>
          </Link>
          <Link href="/CreateAssistant" passHref>
            <Button variant="contained" color="secondary" style={{ marginTop: '10px' }}>
              Create New Assistant
            </Button>
          </Link>
        </Box>
      )}
    </Container>
  );
};

export default CurrentAssistant;
