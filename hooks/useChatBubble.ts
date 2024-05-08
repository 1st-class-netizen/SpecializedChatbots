//hooks/useChatBubble.ts

/**
 * Overview:
 * The `useChatBubble` is a custom React hook designed to manage a conversational UI component's state,
 * specifically focusing on handling chat interactions such as questions and responses.
 * In modern web applications, particularly those involving real-time interactions, managing the flow
 * and state of a conversation can become complex. This hook simplifies state management related to chat
 * functionalities by encapsulating the logic for adding new chat messages to the conversation history
 * and maintaining this history across different instances of the component or throughout the application lifecycle.
 *
 * This hook is an example of how React allows developers to create their own hooks for custom state
 * and logic encapsulation. By using this hook, components can maintain cleaner codebases and share
 * common functionalities without prop drilling or context overuse, thus enhancing modularity and reuse.
 *
 * Functionality:
 * - `conversationHistory`: A stateful array that keeps track of all chat bubbles, which can be questions asked by the user or responses from the system.
 * - `addChatBubble`: A function that allows components to add new chat bubbles to the history, ensuring that the conversation flow is dynamically updated.
 *
 * Usage:
 * Components involved in chat interfaces can utilize `useChatBubble` to handle state related to the chat history and updates, making it easier to render up-to-date UIs based on user interaction and system responses.
 */

// This file defines a custom React hook named `useChatBubble`. A hook is a special function that lets you “hook into” React features. 
// For example, this hook lets components manage and update a list of chat messages, which we call "chat bubbles" here.
// This hook demonstrates how to encapsulate and manage related state logic in React applications, making it reusable across multiple components.

// Import the useState hook from React, which allows us to track state in a functional component.
import { useState } from 'react';

// Define the structure for a chat bubble, which is an object with a 'type' and 'text'.
interface ChatBubble {
  type: 'question' | 'response';  // 'type' can be 'question' (user's input) or 'response' (assistant's reply).
  text: string;                   // 'text' contains the actual message content.
}

// This is the main definition of the `useChatBubble` hook.
export function useChatBubble() {
  // Initialize 'conversationHistory' as an array to store all chat bubbles. It uses 'useState' to maintain state across re-renders.
  const [conversationHistory, setConversationHistory] = useState<ChatBubble[]>([]);

  // Define a function 'addChatBubble' that takes a chat bubble object and adds it to the conversation history.
  // This function demonstrates how to update state that is based on the previous state.
  const addChatBubble = (bubble: ChatBubble) => {
    // Update the conversationHistory by adding the new bubble to the end of the array
    setConversationHistory(prev => [...prev, bubble]); // Appends the new bubble to the existing array of chat bubbles.
  };

  // The hook returns 'conversationHistory' and 'addChatBubble', allowing any component that uses this hook to access the current chat history and to add new bubbles.
  return { conversationHistory, addChatBubble };
}