import React, { useState } from 'react';
import { Box, Button, Fab, Typography } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';

import AssistantDetails from './AssistantDetails';
import ChatHistory from './ChatHistory';
import InputField from './InputField';

const FloatingChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);

  // Mock assistant object, update with real data structure
  const assistant = {
    id: 1,
    name: 'Helper Bot',
    description: 'I am here to assist you!',
    userRole: 'Support',
    modelInfo: 'Based on GPT-3'
  };

  const handleSendClick = () => {
    const newBubble = { type: 'question', text: inputText };
    setConversationHistory([...conversationHistory, newBubble]);
    setInputText('');
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Box sx={{
      position: 'fixed',
      bottom: 16,
      right: 16,
      zIndex: 1000
    }}>
      {!isOpen ? (
        <Fab color="primary" onClick={toggleChat}>
          <ChatIcon />
        </Fab>
      ) : (
        <Box sx={{
          width: 300,
          height: 400,
          backgroundColor: 'background.paper',
          boxShadow: 3,
          borderRadius: 2,
          padding: 2,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Button onClick={toggleChat} sx={{ alignSelf: 'flex-end' }}>
            <CloseIcon />
          </Button>
          <Typography variant="h6" gutterBottom>
            Chat with Assistant
          </Typography>
          <AssistantDetails assistant={assistant} />
          <ChatHistory conversationHistory={conversationHistory} />
          <InputField inputText={inputText} setInputText={setInputText} handleSendClick={handleSendClick} />
        </Box>
      )}
    </Box>
  );
};

export default FloatingChatAssistant;
