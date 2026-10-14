import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_THEME, THEMES, type ThemeId } from '@freetogo/ui';
import i18n, { deviceLang, type Lang } from '../i18n';

/** Device-local preferences (same pattern as texttranslator's Settings). */
export interface Settings {
  theme: ThemeId;
  lang: Lang;
  role: 'collector' | 'merchant';
}

const KEY = 'ftg.settings.v1';
const defaults: Settings = { theme: DEFAULT_THEME, lang: deviceLang(), role: 'collector' };

interface SettingsValue extends Settings {
  loaded: boolean;
  update: (patch: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaults);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!raw) return;
        const saved = { ...defaults, ...(JSON.parse(raw) as Partial<Settings>) };
        if (!THEMES[saved.theme]) saved.theme = DEFAULT_THEME;
        setSettings(saved);
      })
      .catch(() => undefined)
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (i18n.language !== settings.lang) void i18n.changeLanguage(settings.lang);
  }, [settings.lang]);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      void AsyncStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo(() => ({ ...settings, loaded, update }), [settings, loaded, update]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsValue {
  const value = useContext(SettingsContext);
  if (!value) throw new Error('useSettings must be used inside SettingsProvider');
  return value;
}
