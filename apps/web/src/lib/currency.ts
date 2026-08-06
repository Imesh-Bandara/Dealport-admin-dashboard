// Static, approximate USD reference rates for the Add Product currency
// preview. There is no live FX feed in this stack — these are fixed
// snapshot values, not real-time rates, and exist purely so an admin
// pricing a product in USD can see roughly what that looks like in
// another market's currency. The product's stored `price`/`discountPrice`
// are always USD; nothing here changes what gets submitted to the API.
export interface CountryCurrency {
  country: string;
  flag: string;
  currency: string;
  symbol: string;
  /** 1 USD = this many units of `currency` (static snapshot, not live). */
  rateFromUsd: number;
  /** Decimal places typically shown for this currency. */
  decimals: number;
}

export const COUNTRY_CURRENCIES: CountryCurrency[] = [
  { country: "United States", flag: "🇺🇸", currency: "USD", symbol: "$", rateFromUsd: 1, decimals: 2 },
  { country: "Sri Lanka", flag: "🇱🇰", currency: "LKR", symbol: "Rs", rateFromUsd: 300, decimals: 2 },
  { country: "United Kingdom", flag: "🇬🇧", currency: "GBP", symbol: "£", rateFromUsd: 0.79, decimals: 2 },
  { country: "European Union", flag: "🇪🇺", currency: "EUR", symbol: "€", rateFromUsd: 0.92, decimals: 2 },
  { country: "India", flag: "🇮🇳", currency: "INR", symbol: "₹", rateFromUsd: 83, decimals: 2 },
  { country: "Canada", flag: "🇨🇦", currency: "CAD", symbol: "CA$", rateFromUsd: 1.36, decimals: 2 },
  { country: "Australia", flag: "🇦🇺", currency: "AUD", symbol: "AU$", rateFromUsd: 1.52, decimals: 2 },
  { country: "Japan", flag: "🇯🇵", currency: "JPY", symbol: "¥", rateFromUsd: 149, decimals: 0 },
];

export const DEFAULT_COUNTRY_CURRENCY = COUNTRY_CURRENCIES[0];

export function findCountryCurrency(currency: string): CountryCurrency {
  return COUNTRY_CURRENCIES.find((c) => c.currency === currency) ?? DEFAULT_COUNTRY_CURRENCY;
}

/** Converts a USD amount into the given currency using the static snapshot rate. */
export function convertFromUsd(amountUsd: number, target: CountryCurrency): number {
  return amountUsd * target.rateFromUsd;
}

export function formatCurrencyAmount(amount: number, target: CountryCurrency): string {
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: target.decimals,
    maximumFractionDigits: target.decimals,
  });
  return `${target.symbol} ${formatted}`;
}
