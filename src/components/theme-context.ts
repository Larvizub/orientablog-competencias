import { createContext } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export default ThemeContext;
