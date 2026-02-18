'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';

/**
 * Theme Context for Mission Control
 * Provides theme state and functions to all components
 */
const ThemeContext = createContext(null);

/**
 * Storage key for localStorage persistence
 */
const STORAGE_KEY = 'mission-control-theme';

/**
 * Default theme configuration
 */
const DEFAULT_THEME = {
  mode: 'dark',
  accent: 'purple'
};

/**
 * Available accent colors
 */
export const ACCENT_COLORS = {
  purple: { name: 'Purple', value: '#8b5cf6', class: 'accent-purple' },
  blue: { name: 'Blue', value: '#3b82f6', class: 'accent-blue' },
  green: { name: 'Green', value: '#22c55e', class: 'accent-green' },
  orange: { name: 'Orange', value: '#f97316', class: 'accent-orange' }
};

/**
 * Get initial theme from localStorage or system preference
 * Called before React hydration to prevent flash
 */
export function getInitialTheme() {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME;
  }

  try {
    // Check localStorage first
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        mode: parsed.mode || DEFAULT_THEME.mode,
        accent: parsed.accent || DEFAULT_THEME.accent
      };
    }

    // Fall back to system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return {
      mode: prefersDark ? 'dark' : 'light',
      accent: DEFAULT_THEME.accent
    };
  } catch (e) {
    console.warn('Error reading theme from localStorage:', e);
    return DEFAULT_THEME;
  }
}

/**
 * Apply theme to document
 * Sets data attributes for CSS to pick up
 */
export function applyTheme(mode, accent) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  
  // Set theme mode
  if (mode === 'dark') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', 'light');
  }
  
  // Set accent color
  root.setAttribute('data-accent', accent);
}

/**
 * React Hook for theme management
 * @returns {Object} Theme state and control functions
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Theme Provider Component
 * Wraps the app to provide theme context
 */
export function ThemeProvider({ children, initialTheme }) {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState(initialTheme?.mode || DEFAULT_THEME.mode);
  const [accent, setAccentState] = useState(initialTheme?.accent || DEFAULT_THEME.accent);

  // Apply theme whenever it changes
  useEffect(() => {
    applyTheme(mode, accent);
  }, [mode, accent]);

  // Persist to localStorage
  useEffect(() => {
    if (!mounted) {
      setMounted(true);
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode, accent }));
    } catch (e) {
      console.warn('Error saving theme to localStorage:', e);
    }
  }, [mode, accent, mounted]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Only auto-switch if user hasn't manually set a preference
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setMode(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  /**
   * Toggle between light and dark mode
   */
  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  /**
   * Set specific mode
   * @param {string} newMode - 'dark' or 'light'
   */
  const setModeExplicit = useCallback((newMode) => {
    if (newMode === 'dark' || newMode === 'light') {
      setMode(newMode);
    }
  }, []);

  /**
   * Set accent color
   * @param {string} newAccent - 'purple', 'blue', 'green', or 'orange'
   */
  const setAccent = useCallback((newAccent) => {
    if (ACCENT_COLORS[newAccent]) {
      setAccentState(newAccent);
    }
  }, []);

  /**
   * Reset to defaults
   */
  const resetTheme = useCallback(() => {
    setMode(DEFAULT_THEME.mode);
    setAccentState(DEFAULT_THEME.accent);
  }, []);

  const value = {
    // State
    mode,
    accent,
    mounted,
    isDark: mode === 'dark',
    isLight: mode === 'light',
    
    // Actions
    toggleMode,
    setMode: setModeExplicit,
    setAccent,
    resetTheme,
    
    // Constants
    accentColors: ACCENT_COLORS,
    defaultTheme: DEFAULT_THEME
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export default useTheme;
