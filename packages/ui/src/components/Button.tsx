import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space, touch } from '../theme/tokens';
import { Txt } from './Txt';
import { Icon, type IconName } from './Icon';

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  /** primary = active fill; soft = tinted; secondary = outlined; danger = outlined red; quiet = text link. */
  kind?: 'primary' | 'soft' | 'secondary' | 'danger' | 'quiet';
  size?: 'regular' | 'small';
  icon?: IconName;
  busy?: boolean;
  block?: boolean;
}

export function Button({ label, kind = 'primary', size = 'regular', icon, busy, block = true, disabled, ...rest }: ButtonProps) {
  const { colors } = useTheme();
  const inactive = !!(disabled || busy);
  const fg = inactive ? colors.textSecondary : { primary: colors.onActive, soft: colors.textPrimary, secondary: colors.textPrimary, danger: colors.danger, quiet: colors.link }[kind];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: !!busy }}
      disabled={inactive}
      hitSlop={kind === 'quiet' ? 8 : 0}
      {...rest}
      style={({ pressed }) => [
        styles.base,
        { minHeight: size === 'small' ? 40 : touch.button, borderRadius: size === 'small' ? 12 : radius.control, paddingHorizontal: size === 'small' ? space.m : space.xl },
        block && kind !== 'quiet' && { alignSelf: 'stretch' },
        kind === 'primary' && { backgroundColor: colors.active },
        kind === 'soft' && { backgroundColor: colors.primarySoft },
        kind === 'secondary' && { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border },
        kind === 'danger' && { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.dangerSoft },
        kind === 'quiet' && styles.quiet,
        inactive && kind !== 'quiet' && { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
        pressed && { opacity: 0.85 },
      ]}
    >
      {busy ? <ActivityIndicator color={fg} /> : icon ? <Icon name={icon} size={size === 'small' ? 18 : 20} raw={fg} /> : null}
      <Txt variant={size === 'small' ? 'small' : 'body'} weight="bold" style={{ color: fg }} align="center">
        {label}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.s },
  quiet: { minHeight: 40, paddingHorizontal: 0, alignSelf: 'flex-start' },
});

/** Visible explanation under a disabled action (no silent inert buttons). */
export function DisabledWhy({ text }: { text: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: space.s, alignItems: 'flex-start', marginTop: space.s }}>
      <Icon name="info" size={18} color="textSecondary" />
      <Txt variant="small" color="textSecondary" style={{ flex: 1 }}>
        {text}
      </Txt>
    </View>
  );
}
