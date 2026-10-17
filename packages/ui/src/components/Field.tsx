import React, { useEffect, useRef } from 'react';
import { Animated, View, type LayoutChangeEvent } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space } from '../theme/tokens';
import { Txt } from './Txt';
import { Icon } from './Icon';

/**
 * Form field with an inline, visible error state: red outline + soft red tint around the field,
 * red title, icon + explanation right under it. `shake` (any changing number) nudges the field
 * sideways once when the user tries to submit, so the eye finds it.
 */
export function Field({ title, hint, error, shake, onLayout, children }: { title: string; hint?: string; error?: string | null; shake?: number; onLayout?: (e: LayoutChangeEvent) => void; children: React.ReactNode }) {
  const { colors } = useTheme();
  const x = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!error || !shake) return;
    Animated.sequence([6, -6, 4, -4, 0].map((v) => Animated.timing(x, { toValue: v, duration: 55, useNativeDriver: true }))).start();
  }, [shake]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Animated.View
      onLayout={onLayout}
      accessibilityLabel={error ? `${title}. ${error}` : undefined}
      style={[
        { gap: space.s, marginTop: space.s, borderRadius: radius.control, transform: [{ translateX: x }] },
        error ? { padding: space.m, marginHorizontal: -space.m + 2, borderWidth: 1.5, borderColor: colors.danger, backgroundColor: colors.dangerSoft } : null,
      ]}
    >
      <Txt weight="bold" style={error ? { color: colors.danger } : undefined}>{title}</Txt>
      {error ? (
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'flex-start' }} accessibilityLiveRegion="polite">
          <Icon name="alert" size={18} raw={colors.danger} />
          <Txt variant="small" weight="semibold" style={{ color: colors.danger, flex: 1 }}>{error}</Txt>
        </View>
      ) : hint ? <Txt variant="small" color="textSecondary">{hint}</Txt> : null}
      {children}
    </Animated.View>
  );
}

/** Red icon + message, for errors that belong to a group of choices rather than one field. */
export function ErrorLine({ text }: { text: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', padding: space.s + 2, borderRadius: 12, backgroundColor: colors.dangerSoft }} accessibilityLiveRegion="polite">
      <Icon name="alert" size={18} raw={colors.danger} />
      <Txt variant="small" weight="semibold" style={{ color: colors.danger, flex: 1 }}>{text}</Txt>
    </View>
  );
}
