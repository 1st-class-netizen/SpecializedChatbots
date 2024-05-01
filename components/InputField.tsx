//components/InputField.tsx
import React from 'react';  // Explicitly import React (helps in recognizing the file as a module)
import { TextField, Button } from '@mui/material';

interface InputFieldProps {
  inputText: string;
  setInputText: (text: string) => void;
  handleSendClick: () => void;
}

const InputField: React.FC<InputFieldProps> = ({ inputText, setInputText, handleSendClick }) => (
  <>
    <TextField
      fullWidth
      label="Your question"
      variant="outlined"
      value={inputText}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputText(e.target.value)}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSendClick();
        }
      }}
      margin="normal"
    />
    <Button variant="contained" color="primary" onClick={handleSendClick} style={{ marginBottom: '20px' }}>
      Send
    </Button>
  </>
);

export default InputField;  // Maintain as default export