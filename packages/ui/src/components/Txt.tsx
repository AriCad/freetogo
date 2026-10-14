import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { fonts, type, type TypeRole } from '../theme/tokens';
import type { Palette } from '../theme/themes';

export interface TxtProps extends TextProps {
  variant?: TypeRole;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  color?: keyof Palette;
  align?: TextStyle['textAlign'];
}

/** The only text component in the app: type scale + theme colour in one place. */
export function Txt({ variant = 'body', weight, color = 'textPrimary', align, style, ...rest }: TxtProps) {
  const { colors } = useTheme();
  const t = type[variant];
  const w = weight ?? (variant === 'display' || variant === 'title' || variant === 'heading' ? 'bold' : 'regular');
  return (
    <Text
      maxFontSizeMultiplier={1.6}
      {...rest}
      style={[{ color: colors[color], fontSize: t.size, lineHeight: t.line, fontFamily: fonts[w], textAlign: align }, style]}
    />
  );
}
