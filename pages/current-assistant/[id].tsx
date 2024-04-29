import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Container, Typography, Box, Button } from '@mui/material';
import Link from 'next/link';
import AssistantDetails from '../../components/AssistantDetails';
import ChatHistory from '../../components/ChatHistory';
import InputField from '../../components/InputField';
import { useChatBubble } from '../../hooks/useChatBubble';
import { fetchAssistant, sendChat } from '../../utils/api';

const CurrentAssistant = () => {
  const router = useRouter();
  const { id } = router.query;
  const { conversationHistory, addChatBubble } = useChatBubble();
  const [assistant, setAssistant] = useState(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchAssistant(id).then(data => {
        setAssistant(data.assistant);
        setLoading(false);
      }).catch(err => {
        setError('Failed to fetch assistant details');
        setLoading(false);
      });
    }
  }, [id]);

  const handleSendClick = async () => {
    const response = await sendChat(inputText, assistant, addChatBubble, conversationHistory);
    if (response && response.error) {
      setError(response.error);
    } else {
      setInputText('');
      // Play the audio using the URL returned from synthesizeSpeech
      if (response.audioUrl) {
        const audio = new Audio(response.audioUrl);
        audio.play().catch(e => console.error('Playback error:', e));
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>Assistant Details - {assistant?.name}</Typography>
      {assistant && (
        <Box>
          <AssistantDetails assistant={assistant} />
          <ChatHistory conversationHistory={conversationHistory} />
          <InputField inputText={inputText} setInputText={setInputText} handleSendClick={handleSendClick} />
          <Link href="/ListAssistants" passHref><Button variant="contained" color="secondary">Back to List</Button></Link>
          <Link href="/CreateAssistant" passHref><Button variant="contained" color="secondary">Create New Assistant</Button></Link>
        </Box>
      )}
    </Container>
  );
};

export default CurrentAssistant;