import React from 'react';
import { Pressable } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Icon, Txt, radius, space, useTheme } from '@freetogo/ui';
import { useSettings } from '../src/settings/Settings';
import { Screen } from '../src/components/Screen';
import { LANGS } from '../src/i18n';

export default function Language() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { lang, update } = useSettings();
  return (
    <Screen back title={t('lang_title')}>
      {LANGS.map((l) => (
        <Pressable key={l} accessibilityRole="radio" accessibilityState={{ checked: lang === l }} onPress={() => { update({ lang: l }); router.back(); }}
          style={{ flexDirection: 'row', alignItems: 'center', minHeight: 56, paddingHorizontal: 14, borderRadius: radius.control, borderWidth: 1, borderColor: lang === l ? colors.active : colors.border, gap: space.m }}>
          <Txt weight="semibold" style={{ flex: 1 }}>{l === 'fi' ? 'Suomi' : 'English'}</Txt>
          {lang === l ? <Icon name="check" size={22} color="active" /> : null}
        </Pressable>
      ))}
    </Screen>
  );
}
