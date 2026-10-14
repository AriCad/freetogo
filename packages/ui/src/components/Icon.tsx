import React from 'react';
import { SvgXml } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';
import type { Palette } from '../theme/themes';
import { ICONS, type IconName } from './icons';

export function Icon({ name, size = 24, color = 'textPrimary', raw }: { name: IconName; size?: number; color?: keyof Palette; raw?: string }) {
  const { colors } = useTheme();
  const c = raw ?? colors[color];
  const xml = ICONS[name].replace(/currentColor/g, c).replace(/ACCENT/g, colors.accent);
  return <SvgXml xml={xml} width={size} height={size} />;
}
export type { IconName };
