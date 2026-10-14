import React from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, Icon, THEMES, THEME_IDS, Txt, radius, space, useTheme } from '@freetogo/ui';
import { useSettings } from '../src/settings/Settings';
import { Screen } from '../src/components/Screen';

/** Theme 6–10 picker: applies immediately, persisted in settings. */
export default function ThemePicker() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { theme, update } = useSettings();
  return (
    <Screen back title={t('theme_title')} footer={<Button label={t('done')} onPress={() => router.back()} />}>
      <Txt color="textSecondary">{t('theme_s')}</Txt>
      {THEME_IDS.map((id) => {
        const on = id === theme;
        return (
          <Pressable key={id} accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={() => update({ theme: id })}
            style={{ flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 64, paddingHorizontal: 14, borderRadius: radius.control, borderWidth: on ? 2 : 1, borderColor: on ? colors.active : colors.border, backgroundColor: on ? colors.primarySoft : colors.surface }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: THEMES[id].palette.primary }} />
            <View style={{ flex: 1 }}>
              <Txt weight="bold">{t('theme_n', { n: id })} · {THEMES[id].name}</Txt>
              <Txt variant="small" color="textSecondary">{THEMES[id].palette.primary}</Txt>
            </View>
            {on ? <Icon name="check" size={22} color="active" /> : null}
          </Pressable>
        );
      })}
    </Screen>
  );
}
