import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Icon, Txt, gutter, radius, space, useTheme } from '@freetogo/ui';

/** Bottom sheet for confirmations and short forms. */
export function Sheet({ visible, title, onClose, children, dismissable = true }: { visible: boolean; title: string; onClose: () => void; children: React.ReactNode; dismissable?: boolean }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={dismissable ? onClose : () => undefined}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }]} onPress={dismissable ? onClose : undefined} accessibilityLabel={t('close')} />
        <View style={[styles.sheet, { backgroundColor: colors.surface, paddingBottom: insets.bottom + space.l }]} accessibilityViewIsModal>
          <View style={[styles.grab, { backgroundColor: colors.border }]} />
          <View style={styles.head}>
            <Txt variant="heading" style={{ flex: 1 }} accessibilityRole="header">{title}</Txt>
            {dismissable ? (
              <Pressable accessibilityRole="button" accessibilityLabel={t('close')} onPress={onClose} style={[styles.x, { backgroundColor: colors.background }]}>
                <Icon name="x" size={20} />
              </Pressable>
            ) : null}
          </View>
          <ScrollView contentContainerStyle={{ gap: space.m }} keyboardShouldPersistTaps="handled">{children}</ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '90%', borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, paddingHorizontal: gutter, paddingTop: space.s },
  grab: { width: 40, height: 5, borderRadius: 3, alignSelf: 'center', marginBottom: space.m },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.m, marginBottom: space.m },
  x: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
