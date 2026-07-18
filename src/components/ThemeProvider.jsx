import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'theme';

const resolveTheme = (preference) => (
  preference === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : preference
);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEY) || 'system');

  useEffect(() => {
    const applyTheme = () => {
      const resolvedTheme = resolveTheme(theme);
      document.documentElement.classList.toggle('dark-mode', resolvedTheme === 'dark');
      document.documentElement.dataset.theme = resolvedTheme;
    };

    applyTheme();
    localStorage.setItem(STORAGE_KEY, theme);

    if (theme !== 'system') return undefined;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', applyTheme);
    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (resolveTheme(current) === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo(() => ({
    theme,
    setTheme,
    toggleTheme,
    isDarkMode: resolveTheme(theme) === 'dark'
  }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export default ThemeContext;
