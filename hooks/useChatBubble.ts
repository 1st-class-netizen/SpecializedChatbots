// Import useState for managing state within the hook
import { useState } from 'react';

// Define the structure of a chat bubble with type and text
interface ChatBubble {
  type: 'question' | 'response';  // Indicates if it's a user question or assistant response
  text: string;                   // The text content of the bubble
}

// Define the useChatBubble custom hook
export function useChatBubble() {
  // Use useState to create a state variable to store the conversation history as an array of chat bubbles
  const [conversationHistory, setConversationHistory] = useState<ChatBubble[]>([]);

  // Function to add a new chat bubble to the conversation history
  const addChatBubble = (bubble: ChatBubble) => {
    // Update the conversationHistory by adding the new bubble to the end of the array
    setConversationHistory(prev => [...prev, bubble]); 
  };

  // Return the conversation history and the addChatBubble function for use in other components
  return { conversationHistory, addChatBubble };
}