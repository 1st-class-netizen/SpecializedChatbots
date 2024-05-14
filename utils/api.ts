// utils/api.ts

/**
 * This module, 'api.ts', serves as an interface for interacting with the backend API to manage virtual assistants.
 * It illustrates important concepts for beginners in web development, including making asynchronous HTTP requests using axios,
 * handling responses, and integrating custom services like text-to-speech conversion.
 * Key functionalities include:
 * - Fetching data about assistants from a server.
 * - Sending user input to the server and receiving responses.
 * - Transforming text responses into audible speech using a text-to-speech service.
 * This module is fundamental for understanding data flow and API interaction in modern web applications,
 * particularly those built with React and utilizing RESTful APIs.
 */

// This module contains functions to interact with the backend server for fetching and sending data about virtual assistants.
// It uses axios for making HTTP requests and includes integration with a text-to-speech service to enhance user interactions by providing auditory feedback.
// Functions included here demonstrate fundamental concepts like asynchronous operations (using async/await), handling HTTP requests, and structuring API interactions in a React application.


// Import necessary libraries:
// - axios: for making HTTP requests to fetch data and interact with APIs
// - synthesizeSpeech: a custom function from textToSpeechService for converting text to speech
import axios from 'axios';
import synthesizeSpeech from '../services/textToSpeechService';
import dotenv from 'dotenv';
require('dotenv').config();

console.log("APIKEY: " + process.env.REACT_APP_GOOGLE_CLOUD_API_KEY);
let apiKey :string = 'AIzaSyBVHf9S6j4i_w47s8bl9PO5K39dQ6bg96U';
// Function to fetch details of a specific assistant based on its ID
export const fetchAssistant = async (id) => {
  // Send a GET request to the API endpoint with the assistant ID
  const response = await axios.get(`http://localhost:3001/assistants/${id}`); 
  // Return an object containing the assistant data from the response
  return { assistant: response.data }; 
};

// Function to send a chat message to the assistant and get a response
export const sendChat = async (inputText, assistant, addChatBubble, conversationHistory) => {
  // Create a new chat bubble object for the user's input
  const newRequest = { type: 'question', text: inputText }; 
  // Add the user's question to the conversation history
  addChatBubble(newRequest); 

  // Prepare the request body for the generative language API
  const requestBody = {
    contents: [
      // Include information about the user role
      { role: "user", parts: [{ text: assistant?.userRole || 'Default user role' }] },
      // Include information about the AI model
      { role: "model", parts: [{ text: assistant?.modelInfo || "Default model info" }] },
      // Include the entire conversation history up to this point
      ...conversationHistory.concat(newRequest).map(bubble => ({
        role: bubble.type === 'question' ? "user" : "model", 
        parts: [{ text: bubble.text }] 
      }))
    ] 
  };

  // Try to send the request to the generative language API
  try {
    // Set API key and URL for the generative language API
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    // Send a POST request with the prepared body and headers
    const response = await axios.post(`${apiUrl}?key=${apiKey}`, requestBody, { 
      headers: { 'Content-Type': 'application/json' } 
    });

    // Parse the response to extract the assistant's reply
    const parsedResponse = { 
      type: 'response', 
      text: response.data.candidates[0].content.parts.map(part => part.text).join(" ") 
    };
    // Add the assistant's response to the conversation history
    addChatBubble(parsedResponse); 

    // Use the synthesizeSpeech function to convert the assistant's response to audio
    const audioUrl = await synthesizeSpeech({ text: parsedResponse.text, voiceName: "fr-CA-Neural2-B", apiKey }); 
    // Return both the text response and the audio URL
    return { data: parsedResponse, audioUrl };  
  } catch (error) {
    // Log any errors that occur during the API call
    console.error('API call failed:', error);
    // Return an error object if the API call fails
    return { error: "API call failed" };
  }
};