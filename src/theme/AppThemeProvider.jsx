import React, { createContext, useMemo, useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

export const ThemeContext = createContext({
  toggleTheme: () => {},
  isDark: false
});

export const AppThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDark ? 'dark' : 'light',
          primary: {
            main: '#1a6ed8', // A rich blue from the mockup
          },
          secondary: {
            main: '#0dcbb5', // Used in some active elements
          },
          background: {
            default: isDark ? '#121212' : '#f5f7fa',
            paper: isDark ? '#1e1e1e' : '#ffffff',
          },
          text: {
            primary: isDark ? '#ffffff' : '#111827',
            secondary: isDark ? '#a1a1aa' : '#6b7280',
          },
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: { fontSize: '2rem', fontWeight: 600 },
          h2: { fontSize: '1.5rem', fontWeight: 600 },
          h3: { fontSize: '1.25rem', fontWeight: 600 },
          h4: { fontSize: '1rem', fontWeight: 600 },
          h5: { fontSize: '0.875rem', fontWeight: 600 },
          h6: { fontSize: '0.75rem', fontWeight: 600 },
          subtitle1: { fontSize: '1rem', fontWeight: 400 },
          subtitle2: { fontSize: '0.875rem', fontWeight: 500 },
          body1: { fontSize: '1rem', fontWeight: 400 },
          body2: { fontSize: '0.875rem', fontWeight: 400 },
        },
        components: {
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 16,
                boxShadow: isDark 
                  ? '0 4px 6px -1px rgba(0, 0, 0, 0.5)' 
                  : '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                backgroundImage: 'none',
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                textTransform: 'none',
                fontWeight: 500,
              },
            },
          },
        },
      }),
    [isDark]
  );

  return (
    <ThemeContext.Provider value={{ toggleTheme, isDark }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
