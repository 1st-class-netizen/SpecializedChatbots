// Import necessary libraries:
// - React: for building user interfaces
// - Box and Typography from Material UI: for styling the chat bubbles
import React from 'react';
import { Box, Typography } from '@mui/material';

// Define the structure of a chat bubble with type and text
interface ChatBubble {
  type: 'question' | 'response'; // Indicates if it's a user question or assistant response
  text: string;                  // The text content of the bubble
}

// Define the props expected by the ChatHistory component
interface ChatHistoryProps {
  conversationHistory: ChatBubble[]; // An array of chat bubbles
}

// Define the ChatHistory component as a React Functional Component with specific props
const ChatHistory: React.FC<ChatHistoryProps> = ({ conversationHistory }) => (
  <> 
    {conversationHistory.map((bubble, index) => ( // Loop through each bubble in the history
      <Box key={index} sx={{     // Use Box for styling each bubble
          padding: '10px 20px',    // Add padding inside the bubble
          borderRadius: '20px',   // Make the corners rounded
          backgroundColor: bubble.type === 'question' ? '#e0f7fa' : '#b2ebf2', // Set different background colors based on the type
          maxWidth: '80%',         // Limit the maximum width of the bubble
          marginLeft: bubble.type === 'question' ? 'auto' : '10px', // Align questions to the right, responses to the left
          marginRight: bubble.type === 'question' ? '10px' : 'auto',
          marginTop: '10px',      // Add margin at the top
          border: 'none',          // Remove any border (optional)
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)' // Add a subtle shadow effect (optional)
        }}>
        {/* Display the text of the bubble with different colors for questions and responses */}
        <Typography color={bubble.type === 'question' ? "primary" : "secondary"}>{bubble.text}</Typography> 
      </Box>
    ))}
  </>
);

// Export the ChatHistory component as the default export
export default ChatHistory;