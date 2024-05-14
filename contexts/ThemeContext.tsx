import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { createTheme, ThemeProvider as MUIThemeProvider, CssBaseline } from '@mui/material'; // Corrected import
import { PaletteMode } from '@mui/material'; // Importing PaletteMode type for strict type checking

interface ThemeContextType {
  themeMode: PaletteMode;  // Changed to use PaletteMode type
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'light', // default value
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<PaletteMode>('light'); // Now using PaletteMode type

  const toggleTheme = () => {
    setThemeMode(prevMode => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(() => createTheme({
    palette: {
      mode: themeMode,  // No type error as themeMode is now PaletteMode
      background: {
        default: themeMode === 'dark' ? '#121212' : '#fff',
        paper: themeMode === 'dark' ? '#333' : '#fff',
      },
      text: {
        primary: themeMode === 'dark' ? '#fff' : '#000',
        secondary: themeMode === 'dark' ? '#ccc' : '#555',
      }
    },
  }), [themeMode]);

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme }}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />  {/* This component is now correctly imported */}
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
