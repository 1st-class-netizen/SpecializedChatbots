// components/ChatHistory.tsx
/**
 * The ChatHistory component displays a list of chat messages as styled chat bubbles,
 * differentiating between questions from the user and responses from the assistant.
 * This component utilizes React for building the user interface and Material-UI components for styling.
 * It helps new programmers understand how to render lists of items in React and apply conditional styling based on item properties.
 *
 * Each chat bubble is represented by a 'Box' component from Material-UI, which is styled to look like a typical messaging app bubble.
 * The text within each bubble is displayed using the 'Typography' component, also from Material-UI, which allows for easy text styling.
 * This component demonstrates practical uses of React props, JavaScript array mapping, and conditional rendering.
 */
/**
 * ChatHistory Component Overview:
 *
 * This file defines the ChatHistory component, which is responsible for rendering a conversational
 * interface where messages are displayed in a visually distinct "bubble" format. This component is 
 * used in web applications where interactions between a user and an AI assistant are displayed,
 * simulating a real-time chat environment.
 *
 * Key Concepts Illustrated in This Component:
 * - React Functional Components: Utilizes React, a popular JavaScript library for building user interfaces,
 *   to define a component that can manage its own content and presentation.
 * - Material-UI: Leverages components from Material-UI, a library of React components that implement
 *   Google's Material Design guidelines, to provide pre-styled boxes and typography that enhance the 
 *   visual layout of the chat interface.
 * - Props and Mapping: Demonstrates the use of 'props' (properties) to pass data to the component,
 *   specifically a list of message objects. It also shows how to use the JavaScript 'map' function to
 *   render lists of React elements based on array data, which is a common pattern for displaying
 *   repeating elements like lists of messages.
 * - Conditional Styling: Applies conditional styles to elements based on the message type (question or response),
 *   showcasing how React components can dynamically change their appearance based on the data they receive.
 *
 * This component enhances understanding of component-based architecture in web development, showing how
 * encapsulated components manage their behavior and rendering, and interact through well-defined interfaces.
 */

// Import necessary libraries:
// - React: for building user interfaces
// - Box and Typography from Material UI: for styling the chat bubbles
import React from 'react';
import { Box, Typography } from '@mui/material';

// Interface defining the properties of a chat bubble
interface ChatBubble {
  type: 'question' | 'response'; // Indicates if it's a user question or assistant response
  text: string;                  // Type of bubble: 'question' for user inputs, 'response' for assistant replies
}

// Define the props expected by the ChatHistory component
interface ChatHistoryProps {
  conversationHistory: ChatBubble[]; // Array of chat bubbles to be displayed
}

// Functional component to render chat history as a series of styled bubbles
const ChatHistory: React.FC<ChatHistoryProps> = ({ conversationHistory }) => (
    // Render a list of chat bubbles
  <> 
    {conversationHistory.map((bubble, index) => ( // Loop through each bubble in the history
    // Box component for each chat bubble with conditional styling based on the type of message
      <Box key={index} sx={{     // Use Box for styling each bubble
          padding: '10px 20px',    // Uniform padding around the text
          borderRadius: '20px',   // Make the corners rounded, rounded corners for bubble appearance
          backgroundColor: bubble.type === 'question' ? '#e0f7fa' : '#b2ebf2', // Set different background colors based on the type, color varies by message type
          maxWidth: '80%',         // Limit the maximum width of the bubble, maximum width to mimic typical chat bubble behavior
          marginLeft: bubble.type === 'question' ? 'auto' : '10px', // Align questions to the right
          marginRight: bubble.type === 'question' ? '10px' : 'auto', // Align responses to the left
          marginTop: '10px',      // Space between bubbles
          border: 'none',          // Remove any border (optional)
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)' // Add a subtle shadow effect (optional)
        }}>
        {/* Display the text of the bubble with different colors for questions and responses */}
        <Typography color={bubble.type === 'question' ? "primary" : "secondary"}>{bubble.text}</Typography> 
      </Box>
    ))}
  </>
);

// Export the ChatHistory component for use in other parts of the application
export default ChatHistory;