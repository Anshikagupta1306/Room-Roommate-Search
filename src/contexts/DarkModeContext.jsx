// src/context/DarkModeContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';

// Create a context to hold the dark mode state
const DarkModeContext = createContext();

// Create a custom hook to access dark mode state and toggle function
export const useDarkMode = () => {
  return useContext(DarkModeContext);
};

// Create a provider to wrap the entire app with dark mode functionality
export const DarkModeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load dark mode preference from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedMode);
  }, []);

  // Apply dark mode theme to the body element and save to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode);
    if (isDarkMode) {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
    }
  }, [isDarkMode]);

  // Toggle function to switch between dark and light mode
  const toggleDarkMode = () => setIsDarkMode((prevMode) => !prevMode);

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};
