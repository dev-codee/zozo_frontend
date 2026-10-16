'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { convert, formatMoney, validCurrency, type Rates } from '@/app/lib/currency';

type State = { currency: string; rates: Rates; updatedAt: string | null; stale: boolean; automatic: boolean; ready: boolean };
const initial: State = { currency: 'USD', rates: { USD: 1 }, updatedAt: null, stale: true, automatic: true, ready: false };
const CurrencyContext = createContext({ ...initial, selectCurrency: (_currency: string) => { void _currency; }, format: (amount: number, from = 'PKR') => formatMoney(amount, from), convertAmount: (amount: number, from: string, to: string): number | null => from === to ? amount : null });
function cookie(name: string, value: string, age = 31536000) {
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${age}; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
}
export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial);
  const router = useRouter();
  const requestVersion = useRef(0);
  const load = useCallback(async () => {
    const version = ++requestVersion.current;
    try {
      const response = await fetch('/currency-context', { cache: 'no-store' });
      if (!response.ok) throw new Error('Currency unavailable');
      const data = await response.json();
      if (version !== requestVersion.current || !validCurrency(data.currency)) return;
      setState({ ...data, ready: true });
      const previous = document.cookie.split('; ').find(c => c.startsWith('display_currency='))?.split('=')[1];
      cookie('display_currency', data.currency);
      if (previous !== data.currency) router.refresh();
    } catch { if (version === requestVersion.current) setState(s => ({ ...s, ready: true, stale: true })); }
  }, [router]);
  // load updates state only after the asynchronous fetch resolves.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); const timer = setInterval(() => void load(), 60 * 60 * 1000); return () => clearInterval(timer); }, [load]);
  const selectCurrency = (currency: string) => {
    if (currency === 'auto') { cookie('currency_preference', '', 0); void load(); return; }
    if (!validCurrency(currency)) return;
    requestVersion.current++;
    cookie('currency_preference', currency);
    cookie('display_currency', currency);
    setState(s => ({ ...s, currency, automatic: false }));
    router.refresh();
  };
  const format = (amount: number, from = 'PKR') => {
    const converted = convert(amount, from, state.currency, state.rates);
    return formatMoney(converted ?? amount, converted === null ? from : state.currency);
  };
  return <CurrencyContext.Provider value={{ ...state, selectCurrency, format, convertAmount: (amount, from, to) => convert(amount, from, to, state.rates) }}>{children}</CurrencyContext.Provider>;
}
export const useCurrency = () => useContext(CurrencyContext);
