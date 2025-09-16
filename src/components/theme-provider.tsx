import React, { useEffect, useState } from 'react';
import ThemeContext from './theme-context';
import type { Theme } from './theme-context';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem('orientablog-theme') as Theme | null;
      return stored ?? 'system';
    } catch {
      return 'system';
    }
  });

  useEffect(() => {
    const root = document.documentElement;

    const apply = (t: Theme) => {
      if (t === 'system') {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', prefersDark);
      } else {
        root.classList.toggle('dark', t === 'dark');
      }
    };

    apply(theme);
    try {
      localStorage.setItem('orientablog-theme', theme);
    } catch {
      // No podemos escribir en localStorage en algunos entornos; ignorar
    }
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
