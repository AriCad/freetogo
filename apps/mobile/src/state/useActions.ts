import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { setLocation, setNotif, storeById, toggleBell, toggleFavorite, type AppState, type CityId } from '@freetogo/core';
import { useStore } from './AppStore';
import { requestPermission } from '../services/notifications';
import { locateOnce } from '../services/location';
import { cityName } from '../format';

/** Collector actions with their user feedback (toasts, permission prompts). */
export function useActions() {
  const { state, run, showToast } = useStore();
  const { t } = useTranslation();

  /** Ask the OS once; the setting is saved even if the user declines. */
  const ensurePermission = useCallback(async () => {
    if (state.notif.permission === 'granted') return 'granted' as const;
    const p = await requestPermission();
    run((s) => setNotif(s, { permission: p }));
    return p;
  }, [state.notif.permission, run]);

  const toggleFav = useCallback((storeId: string) => {
    const r = run((s) => toggleFavorite(s, storeId));
    showToast(r.value ? (r.state.bells.includes(storeId) ? t('fav_added') : t('fav_added_bell')) : t('fav_removed'));
  }, [run, showToast, t]);

  const toggleShopBell = useCallback(async (storeId: string) => {
    const on = !state.bells.includes(storeId);
    const name = storeById(state, storeId)?.name ?? '';
    if (on) {
      const p = await ensurePermission();
      run((s: AppState) => toggleBell(s, storeId));
      showToast(p === 'granted' ? t('bell_on_toast', { s: name }) : t('perm_denied'));
    } else {
      run((s: AppState) => toggleBell(s, storeId));
      showToast(t('bell_off_toast', { s: name }));
    }
  }, [state, ensurePermission, run, showToast, t]);

  const useGps = useCallback(async () => {
    const r = await locateOnce();
    if (r.status !== 'granted') {
      run((s) => setLocation(s, { gps: 'denied' }));
      return r.status;
    }
    run((s) => setLocation(s, { mode: 'gps', city: r.city, gps: 'granted' }));
    showToast(t('loc_nearest', { city: cityName(r.city) }));
    return 'granted';
  }, [run, showToast, t]);

  const pickCity = useCallback((city: CityId) => run((s) => setLocation(s, { mode: 'city', city })), [run]);

  return { ensurePermission, toggleFav, toggleShopBell, useGps, pickCity };
}
