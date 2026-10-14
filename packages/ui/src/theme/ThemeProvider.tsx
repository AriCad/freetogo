import React, { createContext, useContext, useMemo } from 'react';
import { DEFAULT_THEME, THEMES, type Palette, type ThemeId } from './themes';

export interface Theme {
  id: ThemeId;
  name: string;
  colors: Palette;
}

const ThemeContext = createContext<Theme>({ id: DEFAULT_THEME, name: THEMES[DEFAULT_THEME].name, colors: THEMES[DEFAULT_THEME].palette });

/** One component tree; the selected theme only swaps the palette. */
export function ThemeProvider({ themeId = DEFAULT_THEME, children }: { themeId?: ThemeId; children: React.ReactNode }) {
  const value = useMemo<Theme>(() => {
    const t = THEMES[themeId] ?? THEMES[DEFAULT_THEME];
    return { id: themeId, name: t.name, colors: t.palette };
  }, [themeId]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
