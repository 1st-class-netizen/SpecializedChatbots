// components/AssistantDetails.tsx

/**
 * Overview of AssistantDetails Component:
 * 
 * The AssistantDetails component is designed to display specific details about an "assistant" object,
 * such as their name and description. This component exemplifies how to pass data into React components
 * via props, and how to utilize Material-UI components for styling. The component is straightforward,
 * focusing solely on presenting data in a visually organized format using Material-UI's Box and Typography components.
 * 
 * Key Concepts Demonstrated:
 * - Props: How data is passed down from parent to child component in React.
 * - Material-UI: Use of UI library components for layout and styling.
 * - Functional Component: A simple, stateless component that returns JSX to render the UI.
 * 
 * This component is useful in projects where components need to display or represent data objects,
 * making it a basic but crucial part of larger React applications.
 */

// Import necessary styling components from Material UI library
import { Box, Typography } from '@mui/material';

// Define a functional component that takes props. Here, 'assistant' is expected to have 'name' and 'description' properties.
const AssistantDetails = ({ assistant }) => ( 
  // Render a Box component which acts as a container with default padding and margin.
  <Box>  
    {/* Display the assistant's name as a heading with variant "h5" in a larger typography style for emphasis */}
    <Typography variant="h5">{assistant.name}</Typography> 
    {/* Display the assistant's description in a slightly smaller typography style to differentiate from the name */}
    <Typography variant="subtitle1">{assistant.description}</Typography> 
  </Box>
);

// Export the AssistantDetails component to make it available for use in other parts of the application
export default AssistantDetails;