//pages/current-assistant/[id].tsx

/**
 * The CurrentAssistant component is designed to display detailed information about a specific AI assistant,
 * allow users to interact through a chat interface, and listen to responses via audio.
 * This component showcases several key aspects of a React application:
 * - Routing and URL parameters to identify which assistant to display.
 * - Fetching data from a server using asynchronous API calls.
 * - Managing local state with React's useState hook to handle user inputs and component state.
 * - Side effects like fetching data using React's useEffect hook.
 * - Conditional rendering to handle loading states and display errors.
 * - Reusable components for user input, displaying details, and handling audio playback.
 * This is a comprehensive example useful for understanding how to build interactive and dynamic web interfaces with React.
 */

// Import necessary libraries:
// - React: for building user interfaces
// - useEffect, useState: for managing state and side effects
// - useRouter: for accessing routing information
// - Material UI components: for styling the interface
// - Link: for navigating between pages
// - Custom components: AssistantDetails, ChatHistory, InputField, AudioPlayer
// - Custom hooks: useChatBubble
// - API functions: fetchAssistant, sendChat
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Container, Typography, Box, Button } from '@mui/material';
import Link from 'next/link';
import AssistantDetails from '../../components/AssistantDetails';
import ChatHistory from '../../components/ChatHistory';
import InputField from '../../components/InputField';
import AudioPlayer from '../../components/AudioPlayer';
import { useChatBubble } from '../../hooks/useChatBubble';
import { fetchAssistant, sendChat } from '../../utils/api';

// Define the main component called CurrentAssistant
const CurrentAssistant = () => {
  // Get the router object to access routing information
  const router = useRouter(); 
  // Extract the id parameter from the URL
  const { id } = router.query; 

  // Get the conversation history and addChatBubble function from the custom hook
  const { conversationHistory, addChatBubble } = useChatBubble(); 

  // Use useState to create variables for:
  // - assistant: stores the details of the current assistant
  // - inputText: stores the text entered by the user in the input field
  // - loading: indicates if data is being fetched
  // - error: stores any error messages
  // - audioUrl: stores the URL of the audio response from the assistant
  const [assistant, setAssistant] = useState(null); 
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); 
  const [audioUrl, setAudioUrl] = useState(''); 

  // useEffect to fetch assistant details when the component mounts or the id changes
  useEffect(() => {
    if (id) {
      // Call the fetchAssistant function to get details from the API
      fetchAssistant(id)
        .then(data => {
          // Update the assistant state with the fetched data
          setAssistant(data.assistant); 
          // Set loading to false as data is now available
          setLoading(false); 
        })
        .catch(err => {
          // Set an error message if fetching fails
          setError('Failed to fetch assistant details'); 
          // Log the error to the console for debugging
          console.error(err); 
          // Set loading to false as the process is complete
          setLoading(false);
        });
    }
  }, [id]); // Only run this effect when the id changes

  // This function handles sending the chat message to the assistant
  const handleSendClick = async () => {
    // Call the sendChat function with user input, assistant data, and chat history functions
    const response = await sendChat(inputText, assistant, addChatBubble, conversationHistory); 
    if (response && response.error) {
      // Set an error message if there was an issue with sending the chat
      setError(response.error); 
    } else {
      // Clear the input field after sending the message
      setInputText(''); 
      if (response.audioUrl) {
        // Update the audioUrl state if the assistant responds with audio
        setAudioUrl(response.audioUrl); 
      }
    }
  };

  // Show a loading message while data is being fetched
  if (loading) return <p>Loading...</p>; 
  // Show an error message if there was a problem
  if (error) return <p>Error: {error}</p>; 

  // Render the main content if data is available and there are no errors
  return (
    <Container maxWidth="sm">
      {/* Display the assistant's name in a heading */}
      <Typography variant="h4" gutterBottom>
        Assistant Details - {assistant?.name} 
      </Typography>

      {/* Render the assistant details, chat history, input field, and audio player */}
      {assistant && (
        <Box>
          <AssistantDetails assistant={assistant} />
          <ChatHistory conversationHistory={conversationHistory} />
          <InputField inputText={inputText} setInputText={setInputText} handleSendClick={handleSendClick} />

          {/* Buttons for navigation */}
          <Link href="/" passHref>
            <Button variant="contained" color="secondary">
              Back to List
            </Button>
          </Link>
          <Link href="/CreateAssistant" passHref>
            <Button variant="contained" color="secondary">
              Create New Assistant 
            </Button>
          </Link>

          {/* Render the audio player if there is an audio response */}
          {audioUrl && <AudioPlayer src={audioUrl} />} 
        </Box>
      )}
    </Container>
  );
};

export default CurrentAssistant;