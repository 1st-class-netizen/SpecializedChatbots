//components/AssistantDetails.tsx
import { Box, Typography } from '@mui/material';

const AssistantDetails = ({ assistant }) => (
  <Box>
    <Typography variant="h5">{assistant.name}</Typography>
    <Typography variant="subtitle1">{assistant.description}</Typography>
  </Box>
);

export default AssistantDetails;