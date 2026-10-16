'use client';
import { useCurrency } from '@/app/context/CurrencyContext';
import { SUPPORTED_CURRENCIES } from '@/app/lib/currency';
export default function CurrencySelector() {
  const { currency, automatic, selectCurrency, rates, stale, updatedAt, ready } = useCurrency();
  return <div className="border-t border-border-subtle bg-surface-container-low/50 px-4 py-1.5 text-xs">
    <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
      <label className="flex items-center gap-2 font-medium">Local currency
        <select aria-label="Local currency" value={automatic ? 'auto' : currency} onChange={e => selectCurrency(e.target.value)} className="rounded border border-border-subtle bg-white px-2 py-1 text-text-main">
          <option value="auto">Auto ({currency})</option>
          {SUPPORTED_CURRENCIES.map(code => <option key={code} value={code} disabled={code !== 'PKR' && code !== 'USD' && !rates[code]}>{code}</option>)}
        </select>
      </label>
      <span className="text-text-muted">{ready && !rates.PKR ? 'Conversion unavailable · original currencies shown' : '≈ Converted estimate · local retail prices may differ'}
        {updatedAt && <span> · Rates {updatedAt.slice(0, 10)}{stale ? ' (last available)' : ''}</span>}
        {' · '}<a href="https://www.exchangerate-api.com" target="_blank" rel="noopener noreferrer" className="underline">Rates by ExchangeRate-API</a>
      </span>
    </div>
  </div>;
}
