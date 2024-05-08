//services/textToSpeechService.ts

// This module provides a service for converting text into spoken audio using Google's Text-to-Speech API.
// It defines a function, synthesizeSpeech, that takes text, voice settings, and an API key, then returns a URL pointing to the spoken audio.
// This is especially useful for applications requiring auditory feedback or for accessibility purposes.
// The service encapsulates the complexities of interacting with an external API and processing audio data.

// Import axios for making HTTP requests to the Text-to-Speech API
import axios from 'axios';

// Define the structure of the parameters needed for text-to-speech conversion
interface TextToSpeechParams {
  text: string;        // The text to be converted to speech
  voiceName: string;  // The name of the voice to use
  apiKey: string;      // Your API key for the Text-to-Speech service
}

// Define the main function, synthesizeSpeech, which takes the parameters and returns a Promise
const synthesizeSpeech = async ({ text, voiceName, apiKey }: TextToSpeechParams): Promise<string> => {
  // Construct the URL for the Text-to-Speech API endpoint, including your API key
  const url = `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${apiKey}`;

  // Create the request body with the text, voice settings, and audio format
  const requestBody = {
    input: { text },                 // Specify the text to be synthesized
    voice: {
      languageCode: "fr-CA",         // Set the language code (French Canadian in this case)
      name: voiceName,              // Set the voice name (specific voice from the API)
      ssmlGender: "MALE"            // Set the gender of the voice (male in this case)
    },
    audioConfig: {
      audioEncoding: "MP3"          // Specify the desired audio format (MP3)
    }
  };

  // Send a POST request to the API with the URL, request body, and expected response format
  const response = await axios.post(url, requestBody, { responseType: 'json' });

  // Extract the audio content from the response, which is in base64 encoding
  const audioContentBase64 = response.data.audioContent;

  // Convert the base64 encoded audio content to a Blob (binary data)
  const audioBlob = base64ToBlob(audioContentBase64, 'audio/mp3');

  // Create a URL object that represents the audio Blob, which can be used to play the audio
  return URL.createObjectURL(audioBlob);
};

// This function converts base64 encoded data to a Blob (binary data)
function base64ToBlob(base64, mimeType) {
  // Decode the base64 string into a sequence of bytes
  const byteCharacters = atob(base64);

  // Create an array to store the byte values
  const byteNumbers = new Array(byteCharacters.length);

  // Convert each character to its corresponding byte value
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i); 
  }

  // Create a typed array from the byte values
  const byteArray = new Uint8Array(byteNumbers);

  // Create and return a Blob object representing the binary data with the specified MIME type
  return new Blob([byteArray], { type: mimeType });
}

// Export the synthesizeSpeech function as the default export from this module
export default synthesizeSpeech; 