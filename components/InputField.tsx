// Import necessary libraries:
// - React: for building user interfaces
// - TextField and Button from Material UI: for styling the input field and send button
import React from 'react'; 
import { TextField, Button } from '@mui/material';

// Define the props expected by the InputField component
interface InputFieldProps {
  inputText: string;          // The current text entered in the input field
  setInputText: (text: string) => void; // Function to update the input text
  handleSendClick: () => void; // Function to handle clicking the Send button
}

// Define the InputField component as a React Functional Component with specific props
const InputField: React.FC<InputFieldProps> = ({ inputText, setInputText, handleSendClick }) => (
  <> {/* React Fragment to group elements without adding extra HTML tags */}
    <TextField 
      fullWidth              // Make the input field take up the full width
      label="Your question"   // Set the label text for the input field
      variant="outlined"     // Use the outlined style for the input field
      value={inputText}      // Set the current value of the input field
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputText(e.target.value)} 
      // Update the inputText state whenever the user types something
      onKeyDown={(e: React.KeyboardEvent) => {
        // Check if the Enter key is pressed and the Shift key is not held
        if (e.key === 'Enter' && !e.shiftKey) { 
          // Prevent the default behavior of Enter key (creating a new line)
          e.preventDefault(); 
          // Call the handleSendClick function to send the message
          handleSendClick();  
        }
      }}
      margin="normal"        // Add some margin around the input field
    />
    <Button 
      variant="contained"    // Use the contained style for the button
      color="primary"        // Set the button color to primary
      onClick={handleSendClick} // Call the handleSendClick function when the button is clicked
      style={{ marginBottom: '20px' }} // Add some margin below the button
    >
      Send                  {/* Text displayed on the button */}
    </Button>
  </>
);

// Export the InputField component to make it available for use in other parts of the application
export default InputField; 