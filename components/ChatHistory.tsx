// components/ChatHistory.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';

interface ChatBubble {
  type: 'question' | 'response';
  text: string;
}

interface ChatHistoryProps {
  conversationHistory: ChatBubble[];
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ conversationHistory }) => (
  <>
    {conversationHistory.map((bubble, index) => (
      <Box key={index} sx={{
        padding: '10px 20px',
        borderRadius: '20px', // Makes the edges rounded
        backgroundColor: bubble.type === 'question' ? '#e0f7fa' : '#b2ebf2', // Lighter for questions, slightly darker for responses
        maxWidth: '80%',
        marginLeft: bubble.type === 'question' ? 'auto' : '10px', // Aligns questions to the right and responses to the left
        marginRight: bubble.type === 'question' ? '10px' : 'auto',
        marginTop: '10px',
        border: 'none', // Optional: remove border if you prefer without it
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)' // Optional: adds subtle shadow for depth
      }}>
        <Typography color={bubble.type === 'question' ? "primary" : "secondary"}>{bubble.text}</Typography>
      </Box>
    ))}
  </>
);

export default ChatHistory; // Make sure it's a default export
