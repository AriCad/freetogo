import React from 'react';
import { Pressable, StyleSheet, Switch as RNSwitch, View, type ViewProps } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { radius, shadow, space, touch } from '../theme/tokens';
import type { Palette } from '../theme/themes';
import { Txt } from './Txt';
import { Icon, type IconName } from './Icon';

/** White block on the page background. */
export function Block({ style, children, flat, ...rest }: ViewProps & { flat?: boolean }) {
  const { colors } = useTheme();
  return (
    <View {...rest} style={[styles.block, { backgroundColor: colors.surface, borderColor: colors.border }, !flat && shadow.card, style]}>
      {children}
    </View>
  );
}

export function Divider({ dashed }: { dashed?: boolean }) {
  const { colors } = useTheme();
  return <View style={{ height: 0, borderTopWidth: 1, borderColor: colors.border, borderStyle: dashed ? 'dashed' : 'solid' }} />;
}

/** Small rounded label: badge (tinted), outline (dashed for walk-in), dark, ok, danger. */
export function Pill({ label, tone = 'badge', icon }: { label: string; tone?: 'badge' | 'walk' | 'dark' | 'ok' | 'danger' | 'light'; icon?: IconName }) {
  const { colors } = useTheme();
  const m = {
    badge: { bg: colors.badge, fg: colors.badgeText, border: colors.badge, dash: false },
    walk: { bg: colors.surface, fg: colors.badgeText, border: colors.badgeText, dash: true },
    dark: { bg: colors.textPrimary, fg: colors.surface, border: colors.textPrimary, dash: false },
    ok: { bg: colors.okSoft, fg: colors.ok, border: colors.okSoft, dash: false },
    danger: { bg: colors.dangerSoft, fg: colors.danger, border: colors.dangerSoft, dash: false },
    light: { bg: 'rgba(255,255,255,0.96)', fg: colors.textPrimary, border: 'rgba(255,255,255,0.96)', dash: false },
  }[tone];
  return (
    <View style={[styles.pill, { backgroundColor: m.bg, borderColor: m.border, borderStyle: m.dash ? 'dashed' : 'solid' }]}>
      {icon ? <Icon name={icon} size={14} raw={tone === 'light' ? colors.accent : m.fg} /> : null}
      <Txt variant="tiny" weight="bold" style={{ color: m.fg, fontSize: 12.5 }}>
        {label}
      </Txt>
    </View>
  );
}

/** Tappable list row. */
export function Row({ title, detail, icon, trailing, onPress, chevron = !!onPress }: { title: string; detail?: string; icon?: IconName; trailing?: React.ReactNode; onPress?: () => void; chevron?: boolean }) {
  const { colors } = useTheme();
  const body = (
    <>
      {icon ? <Icon name={icon} size={22} color="icon" /> : null}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Txt weight="semibold" numberOfLines={1}>{title}</Txt>
        {detail ? <Txt variant="small" color="textSecondary">{detail}</Txt> : null}
      </View>
      {trailing}
      {chevron ? <Icon name="right" size={20} raw={colors.border} /> : null}
    </>
  );
  return onPress ? (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.background }]}>
      {body}
    </Pressable>
  ) : (
    <View style={styles.row}>{body}</View>
  );
}

export function SwitchRow({ title, detail, value, onChange, disabled }: { title: string; detail?: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Txt weight="semibold">{title}</Txt>
        {detail ? <Txt variant="small" color="textSecondary">{detail}</Txt> : null}
      </View>
      <RNSwitch
        accessibilityLabel={title}
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{ true: colors.active, false: colors.border }}
        thumbColor="#FFFFFF"
        {...({ activeThumbColor: '#FFFFFF' } as object)}
      />
    </View>
  );
}

/** Multi-select checkbox tile (food groups are always checkboxes, never radios). */
export function Check({ label, checked, onPress }: { label: string; checked: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onPress}
      style={[styles.check, { borderColor: checked ? colors.active : colors.border, backgroundColor: checked ? colors.primarySoft : colors.surface }]}
    >
      <View style={[styles.box, { borderColor: checked ? colors.active : colors.border, backgroundColor: checked ? colors.active : 'transparent' }]}>
        {checked ? <Icon name="check" size={16} raw={colors.onActive} /> : null}
      </View>
      <Txt variant="small" weight="semibold" style={{ flex: 1 }}>{label}</Txt>
    </Pressable>
  );
}

/** Segmented control (selected uses the theme's selected/onSelected pair). */
export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.seg, { backgroundColor: colors.background, borderColor: colors.border }]} accessibilityRole="tablist">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable key={o.value} accessibilityRole="tab" accessibilityState={{ selected: on }} onPress={() => onChange(o.value)} style={[styles.segBtn, on && { backgroundColor: colors.selected }]}>
            <Txt variant="small" weight={on ? 'bold' : 'semibold'} style={{ color: on ? colors.onSelected : colors.textSecondary }}>
              {o.label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Callout({ tone = 'info', icon = 'info', title, children }: { tone?: 'info' | 'ok' | 'danger' | 'brand'; icon?: IconName; title?: string; children?: React.ReactNode }) {
  const { colors } = useTheme();
  const m: Record<string, [string, keyof Palette | null, string]> = {
    info: [colors.background, 'textPrimary', colors.border],
    ok: [colors.okSoft, null, colors.ok],
    danger: [colors.dangerSoft, null, colors.danger],
    brand: [colors.primarySoft, 'textPrimary', colors.primarySoft],
  };
  const [bg, , fgRaw] = m[tone]!;
  const fg = tone === 'ok' ? colors.ok : tone === 'danger' ? colors.danger : colors.textPrimary;
  return (
    <View style={[styles.callout, { backgroundColor: bg, borderColor: tone === 'info' ? fgRaw : bg }]}>
      <Icon name={icon} size={20} raw={tone === 'info' || tone === 'brand' ? colors.icon : fg} />
      <View style={{ flex: 1, gap: 2 }}>
        {title ? <Txt variant="small" weight="bold" style={{ color: fg }}>{title}</Txt> : null}
        {typeof children === 'string' ? <Txt variant="small" style={{ color: fg }}>{children}</Txt> : children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { borderRadius: radius.card, borderWidth: 1, padding: space.l },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, height: 26, paddingHorizontal: 10, borderRadius: radius.pill, borderWidth: 1.5, alignSelf: 'flex-start' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 56, paddingVertical: space.s },
  check: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: touch.min, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, borderWidth: 1.5, flexBasis: '48%', flexGrow: 1 },
  box: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  seg: { flexDirection: 'row', borderRadius: radius.control, borderWidth: 1, padding: 3 },
  segBtn: { flex: 1, minHeight: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  callout: { flexDirection: 'row', gap: space.s + 2, padding: space.m, borderRadius: 14, borderWidth: 1 },
});
