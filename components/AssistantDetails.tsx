// Import necessary styling components from Material UI library
import { Box, Typography } from '@mui/material';

// Define a functional component called AssistantDetails that receives "assistant" as a prop (input)
const AssistantDetails = ({ assistant }) => ( 
  // Use a Box component as a container for the assistant details
  <Box>  
    {/* Display the assistant's name as a heading with variant "h5" */}
    <Typography variant="h5">{assistant.name}</Typography> 
    {/* Display the assistant's description as a subtitle with variant "subtitle1" */}
    <Typography variant="subtitle1">{assistant.description}</Typography> 
  </Box>
);

// Export the AssistantDetails component to make it available for use in other parts of the application
export default AssistantDetails;