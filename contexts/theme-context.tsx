'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const defaultContextValue: ThemeContextType = {
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
};

const ThemeContext = createContext<ThemeContextType>(defaultContextValue);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    try {
      // Force light theme as default - ignore any saved dark theme preference
      setTheme('light');
      // Clear any existing dark theme preference
      localStorage.setItem('theme', 'light');
    } catch (error) {
      // Fallback to light theme if localStorage is not available
      setTheme('light');
    }
    setMounted(true);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (mounted) {
      const root = document.documentElement;
      // Force remove dark class and ensure light mode
      root.classList.remove('dark');
      if (theme === 'dark') {
        root.classList.add('dark');
      }
      try {
        localStorage.setItem('theme', theme);
      } catch (error) {
        // Ignore localStorage errors
        console.warn('Could not save theme to localStorage:', error);
      }
    }
  }, [theme, mounted]);

  // Additional effect to ensure dark mode is cleared on initial load
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <div className={mounted ? '' : 'opacity-0'}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  return context;
}