import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_FILTER, offerById, seedState, storeById, tick, type AppState, type DiscoverFilter, type Effect, type Result } from '@freetogo/core';
import i18n from '../i18n';
import { getPermission, notify } from '../services/notifications';
import { slot, time } from '../format';

/**
 * On-device mock service. Every change goes through a pure rule from @freetogo/core, so the same
 * rules can move to a backend later. Nothing leaves the phone.
 */
const KEY = 'ftg.state.v1';

export interface Banner { title: string; body: string; href: string }

interface StoreValue {
  ready: boolean;
  state: AppState;
  now: number;
  run: <T>(fn: (s: AppState, now: number) => Result<T>) => Result<T>;
  filter: DiscoverFilter;
  setFilter: (f: DiscoverFilter) => void;
  banner: Banner | null;
  dismissBanner: () => void;
  toast: string | null;
  showToast: (msg: string) => void;
  reset: () => void;
}

const Ctx = createContext<StoreValue | null>(null);

function effectMessage(s: AppState, e: Effect): Banner | null {
  if (e.type === 'alert') {
    const o = offerById(s, e.offerId);
    const st = o && storeById(s, o.storeId);
    if (!o || !st) return null;
    return o.distributionMode === 'WALK_IN'
      ? { title: i18n.t('push_walkin_t', { store: st.name }), body: i18n.t('push_walkin_s', { what: o.what ?? '' }), href: `/offer/${o.id}?from=alert` }
      : { title: i18n.t('push_new_bags_t', { store: st.name, n: o.qtyTotal ?? 0 }), body: i18n.t('push_new_bags_s', { s: time(o.start), e: time(o.end) }), href: `/offer/${o.id}?from=alert` };
  }
  if (e.type === 'cancelled') {
    const st = storeById(s, e.storeId);
    return { title: i18n.t('push_cancel_t'), body: i18n.t('push_cancel_s', { store: st?.name ?? '', r: i18n.t(`mc_${e.reason}`).toLowerCase() }), href: '/pickups' };
  }
  const o = offerById(s, e.offerId);
  const st = o && storeById(s, o.storeId);
  return { title: i18n.t('push_remind_t'), body: `${st?.name ?? ''} · ${o ? slot(o.start, o.end) : ''}`, href: '/pickups' };
}

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => seedState(Date.now()));
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [filter, setFilter] = useState<DiscoverFilter>(DEFAULT_FILTER);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const ref = useRef(state);
  ref.current = state;
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bannerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persist = useCallback((s: AppState) => {
    void AsyncStorage.setItem(KEY, JSON.stringify(s)).catch(() => undefined);
  }, []);

  const handleEffects = useCallback((s: AppState, effects: Effect[]) => {
    for (const e of effects) {
      const msg = effectMessage(s, e);
      if (!msg) continue;
      void notify(msg.title, msg.body, { href: msg.href });
      setBanner(msg);
      if (bannerTimer.current) clearTimeout(bannerTimer.current);
      bannerTimer.current = setTimeout(() => setBanner(null), 8000);
    }
  }, []);

  const run = useCallback(<T,>(fn: (s: AppState, now: number) => Result<T>): Result<T> => {
    const t = Date.now();
    const r = fn(ref.current, t);
    if (r.ok) {
      ref.current = r.state;
      setState(r.state);
      persist(r.state);
      handleEffects(r.state, r.effects);
    }
    setNow(t);
    return r;
  }, [persist, handleEffects]);

  useEffect(() => {
    void (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        let s = raw ? (JSON.parse(raw) as AppState) : seedState(Date.now());
        if (s.version !== 1) s = seedState(Date.now());
        const perm = await getPermission();
        if (perm !== 'unknown' && perm !== s.notif.permission) s = { ...s, notif: { ...s.notif, permission: perm } };
        ref.current = s;
        setState(s);
      } catch {
        /* keep seed */
      } finally {
        setReady(true);
      }
    })();
  }, []);

  // Clock: refresh relative times, expire reservations, send pickup reminders.
  useEffect(() => {
    let prev = Date.now();
    const id = setInterval(() => {
      const t = Date.now();
      const r = tick(ref.current, prev, t);
      prev = t;
      ref.current = r.state;
      setState(r.state);
      setNow(t);
      handleEffects(r.state, r.effects);
    }, 30_000);
    return () => clearInterval(id);
  }, [handleEffects]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const reset = useCallback(() => {
    const s = seedState(Date.now());
    ref.current = s;
    setState(s);
    persist(s);
    setFilter(DEFAULT_FILTER);
  }, [persist]);

  const value = useMemo<StoreValue>(
    () => ({ ready, state, now, run, filter, setFilter, banner, dismissBanner: () => setBanner(null), toast, showToast, reset }),
    [ready, state, now, run, filter, banner, toast, showToast, reset],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): StoreValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore must be used inside AppStoreProvider');
  return v;
}
