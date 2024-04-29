import axios from 'axios';
import synthesizeSpeech from '../services/textToSpeechService';

export const fetchAssistant = async (id) => {
  const response = await axios.get(`http://localhost:3001/assistants/${id}`);
  return { assistant: response.data };
};

export const sendChat = async (inputText, assistant, addChatBubble, conversationHistory) => {
  const newRequest = { type: 'question', text: inputText };
  addChatBubble(newRequest);
  const requestBody = {
    contents: [
      { role: "user", parts: [{ text: assistant?.userRole || 'Default user role' }] },
      { role: "model", parts: [{ text: assistant?.modelInfo || "Default model info" }] },
      ...conversationHistory.concat(newRequest).map(bubble => ({
        role: bubble.type === 'question' ? "user" : "model",
        parts: [{ text: bubble.text }]
      }))
    ]
  };

  try {
    const apiKey = 'AIzaSyBVHf9S6j4i_w47s8bl9PO5K39dQ6bg96U';
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

    const response = await axios.post(`${apiUrl}?key=${apiKey}`, requestBody, {
      headers: { 'Content-Type': 'application/json' }
    });
    const parsedResponse = { type: 'response', text: response.data.candidates[0].content.parts.map(part => part.text).join(" ") };
    addChatBubble(parsedResponse);

    // Synthesize speech and return URL for playback
    const audioUrl = await synthesizeSpeech({ text: parsedResponse.text, voiceName: "fr-CA-Neural2-B", apiKey });
    return { data: parsedResponse, audioUrl };  // Include audio URL in response
  } catch (error) {
    console.error('API call failed:', error);
    return { error: "API call failed" };
  }
};
