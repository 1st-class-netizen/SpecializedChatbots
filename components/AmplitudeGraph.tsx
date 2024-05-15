import React from 'react';
import { Box } from '@mui/material';

interface AmplitudeGraphProps {
  dataArray: Uint8Array;
}

const AmplitudeGraph: React.FC<AmplitudeGraphProps> = ({ dataArray }) => {
  const maxAmplitude = 255; // Adjust based on your actual maximum amplitude

  // Calculate the average to set a baseline for the oscillation
  const averageAmplitude = dataArray.length > 0
    ? dataArray.reduce((acc, value) => acc + value, 0) / dataArray.length
    : 0;

  // Dimensions of the square container
  const containerSize = 50; // Size of the SVG container in pixels
  const lineY = containerSize - (averageAmplitude / maxAmplitude * containerSize)*3; // Calculate position without toFixed for calculation

  return (
    <Box sx={{ width: `${containerSize}px`, height: `${containerSize}px`, overflow: 'hidden', border: '1px solid black', backgroundColor: '#eee' }}>
      <svg width="100%" height="100%">
        <line
          x1="0"
          y1={lineY.toFixed(2)} // Use toFixed here for rendering precision
          x2="100%"
          y2={lineY.toFixed(2)} // Use toFixed here for rendering precision
          stroke="rgba(75, 192, 192, 1)"
          strokeWidth="2"
        />
      </svg>
    </Box>
  );
};

export default AmplitudeGraph;
