//components/ChatHistory.tsx
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
      <Box key={index} style={{ padding: '10px', border: '1px solid black', margin: '10px 0' }}>
        <Typography color={bubble.type === 'question' ? "primary" : "secondary"}>{bubble.text}</Typography>
      </Box>
    ))}
  </>
);

export default ChatHistory;  // Make sure it's a default export