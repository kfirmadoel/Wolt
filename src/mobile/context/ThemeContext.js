import React, { createContext, useContext, useState } from 'react';
import { COLORS, DARK_COLORS } from '../config';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(false);
  const colors = dark ? DARK_COLORS : COLORS;
  const toggleTheme = () => setDark((value) => !value);

  return (
    <ThemeContext.Provider value={{ dark, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
