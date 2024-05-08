//components/InputField.tsx

/**
 * This InputField component is a reusable UI element in our React application that allows users to type
 * text and submit it with a button. It's designed to be used in contexts where user input is needed,
 * such as sending messages or entering data. The component uses Material-UI components to ensure
 * that the input field and button are not only functional but also visually appealing and consistent
 * with the rest of the application's design.
 *
 * The component is structured to handle user interactions effectively:
 * - The TextField component is used for the user to enter text. It is styled to fit the full width of its container,
 *   making it easily accessible and prominent for the user.
 * - The Button component allows the user to submit their input. It reacts to clicks, triggering any functionality
 *   that needs the input text, such as sending a message.
 *
 * Both the TextField and Button are imported from Material-UI, a popular library for building React user interfaces
 * that provides ready-made components which are both functional and aesthetic.
 *
 * The component is defined as a functional component in React, making use of React's useState for managing local state
 * and handling user input through controlled components. This approach ensures that the input field is directly tied
 * to the component's state, providing real-time updates to the user interface based on user interaction.
 *
 * Here's a breakdown of how the component works:
 * - The TextField captures and displays the input from the user. As the user types, the state of the component is updated
 *   to reflect the text in the input field.
 * - When the user presses the 'Enter' key or clicks the 'Send' button, the text is processed or sent to another part of the application.
 * - The input field is cleared upon submission to prepare for new input, enhancing the user experience by making the component ready for
 *   repeated use without requiring manual clearing of the previous text.
 *
 * This component illustrates basic but crucial concepts of web development with React, including component structure, event handling,
 * state management, and interaction with styled components from external libraries.
 */

// Import necessary libraries:
// - React: for building user interfaces
// - TextField and Button from Material UI: for styling the input field and send button
import React from 'react'; 
import { TextField, Button } from '@mui/material';

// Define the properties that InputField expects to receive when it is used in a React application.
interface InputFieldProps {
  inputText: string;          // The current text entered in the input field
  setInputText: (text: string) => void; // Function to update the state of inputText in the parent component.
  handleSendClick: () => void; // Function to be called when the user wants to send their message.
}

// The InputField component definition. It is a function that takes props and returns JSX, the syntax used to describe what the UI should look like.
const InputField: React.FC<InputFieldProps> = ({ inputText, setInputText, handleSendClick }) => (
  <> {/* React Fragment to group elements without adding extra HTML tags to group together multiple elements without adding extra nodes to the DOM. */}
    <TextField   // TextField is a Material-UI component that renders an input element with labels and other features.
      fullWidth              // This prop makes the TextField stretch to fill the full width of its container.
      label="Your question"   // Set the label text for the input field
      variant="outlined"     // Defines the style of the TextField to have an outline.
      value={inputText}      // The current value of the TextField, which displays the text the user has typed.
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputText(e.target.value)} // This function is called whenever the user types in the TextField.
      // Update the inputText state whenever the user types something
      // This event handler listens for key presses while the input is focused.
      onKeyDown={(e: React.KeyboardEvent) => {
        // Check if the key pressed is 'Enter' without the 'Shift' key.
        if (e.key === 'Enter' && !e.shiftKey) { 
          // Prevents the default action of the Enter key (which can be submitting a form or inserting a new line).
          e.preventDefault(); 
          // Call the handleSendClick function to send the message
          handleSendClick();  
        }
      }}
      margin="normal"        // Adds standard spacing around the TextField.
    />
    <Button  // Button is a Material-UI component that renders a clickable button.
      variant="contained"    // "Contained" variant gives the button more emphasis with a filled background.
      color="primary"        // Sets the button color to the theme's primary color.
      onClick={handleSendClick} // Call the handleSendClick function when the button is clicked
      style={{ marginBottom: '20px' }} // Adds a margin below the button to space it from other content.
    >
      Send                  {/* Text displayed on the button */}
    </Button>
  </>
);

// Export the InputField component to make it available for use in other parts of the application
export default InputField; 