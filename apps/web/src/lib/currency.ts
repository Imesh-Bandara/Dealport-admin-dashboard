// Static, approximate USD reference rates for the Add Product currency
// preview. There is no live FX feed in this stack — these are fixed
// snapshot values, not real-time rates. They exist so an admin can price a
// product in whichever currency is convenient and see it converted live;
// the product's stored `price`/`discountPrice` are always normalized back
// to USD at submit time (see ProductForm's buildPayload).
export interface CountryCurrency {
  /** Unique — several countries can share a currency (e.g. the eurozone),
   *  so selection is tracked by country, not by currency code alone. */
  country: string;
  /** ISO 3166-1 alpha-2 code, used to derive the flag emoji. */
  iso2: string;
  /** Derived from `iso2` via flagEmoji() — see COUNTRY_CURRENCIES below. */
  flag: string;
  currency: string;
  symbol: string;
  /** 1 USD = this many units of `currency` (static snapshot, not live). */
  rateFromUsd: number;
  /** Decimal places conventionally shown for this currency. */
  decimals: number;
}

/** Regional-indicator flag emoji derived from an ISO 3166-1 alpha-2 code. */
export function flagEmoji(iso2: string): string {
  return iso2
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

// Broad, multi-region list rather than every UN member state — currencies
// for very thinly-traded markets are omitted rather than guessing a rate
// with low confidence. Add more rows here if you need a specific country.
type RawEntry = Omit<CountryCurrency, "flag">;

const ENTRIES: RawEntry[] = [
  // North America
  { country: "United States", iso2: "US", currency: "USD", symbol: "$", rateFromUsd: 1, decimals: 2 },
  { country: "Canada", iso2: "CA", currency: "CAD", symbol: "CA$", rateFromUsd: 1.36, decimals: 2 },
  { country: "Mexico", iso2: "MX", currency: "MXN", symbol: "MX$", rateFromUsd: 17, decimals: 2 },
  // Central America / Caribbean
  { country: "Guatemala", iso2: "GT", currency: "GTQ", symbol: "Q", rateFromUsd: 7.7, decimals: 2 },
  { country: "Costa Rica", iso2: "CR", currency: "CRC", symbol: "₡", rateFromUsd: 520, decimals: 2 },
  { country: "Panama", iso2: "PA", currency: "USD", symbol: "$", rateFromUsd: 1, decimals: 2 },
  { country: "Jamaica", iso2: "JM", currency: "JMD", symbol: "J$", rateFromUsd: 156, decimals: 2 },
  { country: "Dominican Republic", iso2: "DO", currency: "DOP", symbol: "RD$", rateFromUsd: 60, decimals: 2 },
  { country: "Bahamas", iso2: "BS", currency: "BSD", symbol: "B$", rateFromUsd: 1, decimals: 2 },
  // South America
  { country: "Brazil", iso2: "BR", currency: "BRL", symbol: "R$", rateFromUsd: 5.4, decimals: 2 },
  { country: "Argentina", iso2: "AR", currency: "ARS", symbol: "AR$", rateFromUsd: 990, decimals: 2 },
  { country: "Chile", iso2: "CL", currency: "CLP", symbol: "CL$", rateFromUsd: 960, decimals: 0 },
  { country: "Colombia", iso2: "CO", currency: "COP", symbol: "CO$", rateFromUsd: 4100, decimals: 0 },
  { country: "Peru", iso2: "PE", currency: "PEN", symbol: "S/", rateFromUsd: 3.75, decimals: 2 },
  { country: "Uruguay", iso2: "UY", currency: "UYU", symbol: "$U", rateFromUsd: 40, decimals: 2 },
  { country: "Bolivia", iso2: "BO", currency: "BOB", symbol: "Bs", rateFromUsd: 6.9, decimals: 2 },
  { country: "Paraguay", iso2: "PY", currency: "PYG", symbol: "₲", rateFromUsd: 7500, decimals: 0 },
  { country: "Venezuela", iso2: "VE", currency: "VES", symbol: "Bs.S", rateFromUsd: 40, decimals: 2 },
  { country: "Ecuador", iso2: "EC", currency: "USD", symbol: "$", rateFromUsd: 1, decimals: 2 },
  // Europe — eurozone
  { country: "Germany", iso2: "DE", currency: "EUR", symbol: "€", rateFromUsd: 0.92, decimals: 2 },
  { country: "France", iso2: "FR", currency: "EUR", symbol: "€", rateFromUsd: 0.92, decimals: 2 },
  { country: "Italy", iso2: "IT", currency: "EUR", symbol: "€", rateFromUsd: 0.92, decimals: 2 },
  { country: "Spain", iso2: "ES", currency: "EUR", symbol: "€", rateFromUsd: 0.92, decimals: 2 },
  { country: "Netherlands", iso2: "NL", currency: "EUR", symbol: "€", rateFromUsd: 0.92, decimals: 2 },
  { country: "Belgium", iso2: "BE", currency: "EUR", symbol: "€", rateFromUsd: 0.92, decimals: 2 },
  { country: "Austria", iso2: "AT", currency: "EUR", symbol: "€", rateFromUsd: 0.92, decimals: 2 },
  { country: "Portugal", iso2: "PT", currency: "EUR", symbol: "€", rateFromUsd: 0.92, decimals: 2 },
  { country: "Ireland", iso2: "IE", currency: "EUR", symbol: "€", rateFromUsd: 0.92, decimals: 2 },
  { country: "Finland", iso2: "FI", currency: "EUR", symbol: "€", rateFromUsd: 0.92, decimals: 2 },
  { country: "Greece", iso2: "GR", currency: "EUR", symbol: "€", rateFromUsd: 0.92, decimals: 2 },
  // Europe — non-eurozone
  { country: "United Kingdom", iso2: "GB", currency: "GBP", symbol: "£", rateFromUsd: 0.79, decimals: 2 },
  { country: "Switzerland", iso2: "CH", currency: "CHF", symbol: "CHF", rateFromUsd: 0.88, decimals: 2 },
  { country: "Sweden", iso2: "SE", currency: "SEK", symbol: "kr", rateFromUsd: 10.5, decimals: 2 },
  { country: "Norway", iso2: "NO", currency: "NOK", symbol: "kr", rateFromUsd: 10.7, decimals: 2 },
  { country: "Denmark", iso2: "DK", currency: "DKK", symbol: "kr", rateFromUsd: 6.9, decimals: 2 },
  { country: "Poland", iso2: "PL", currency: "PLN", symbol: "zł", rateFromUsd: 4.0, decimals: 2 },
  { country: "Czech Republic", iso2: "CZ", currency: "CZK", symbol: "Kč", rateFromUsd: 23, decimals: 2 },
  { country: "Hungary", iso2: "HU", currency: "HUF", symbol: "Ft", rateFromUsd: 360, decimals: 0 },
  { country: "Romania", iso2: "RO", currency: "RON", symbol: "lei", rateFromUsd: 4.6, decimals: 2 },
  { country: "Iceland", iso2: "IS", currency: "ISK", symbol: "kr", rateFromUsd: 138, decimals: 0 },
  { country: "Russia", iso2: "RU", currency: "RUB", symbol: "₽", rateFromUsd: 92, decimals: 2 },
  { country: "Ukraine", iso2: "UA", currency: "UAH", symbol: "₴", rateFromUsd: 40, decimals: 2 },
  { country: "Turkey", iso2: "TR", currency: "TRY", symbol: "₺", rateFromUsd: 34, decimals: 2 },
  // Middle East
  { country: "United Arab Emirates", iso2: "AE", currency: "AED", symbol: "AED", rateFromUsd: 3.67, decimals: 2 },
  { country: "Saudi Arabia", iso2: "SA", currency: "SAR", symbol: "SAR", rateFromUsd: 3.75, decimals: 2 },
  { country: "Qatar", iso2: "QA", currency: "QAR", symbol: "QAR", rateFromUsd: 3.64, decimals: 2 },
  { country: "Kuwait", iso2: "KW", currency: "KWD", symbol: "KD", rateFromUsd: 0.31, decimals: 3 },
  { country: "Bahrain", iso2: "BH", currency: "BHD", symbol: "BD", rateFromUsd: 0.38, decimals: 3 },
  { country: "Oman", iso2: "OM", currency: "OMR", symbol: "OMR", rateFromUsd: 0.38, decimals: 3 },
  { country: "Jordan", iso2: "JO", currency: "JOD", symbol: "JD", rateFromUsd: 0.71, decimals: 3 },
  { country: "Israel", iso2: "IL", currency: "ILS", symbol: "₪", rateFromUsd: 3.7, decimals: 2 },
  { country: "Lebanon", iso2: "LB", currency: "LBP", symbol: "LL", rateFromUsd: 89500, decimals: 0 },
  // South Asia
  { country: "India", iso2: "IN", currency: "INR", symbol: "₹", rateFromUsd: 83, decimals: 2 },
  { country: "Pakistan", iso2: "PK", currency: "PKR", symbol: "₨", rateFromUsd: 278, decimals: 2 },
  { country: "Bangladesh", iso2: "BD", currency: "BDT", symbol: "৳", rateFromUsd: 110, decimals: 2 },
  { country: "Sri Lanka", iso2: "LK", currency: "LKR", symbol: "Rs", rateFromUsd: 300, decimals: 2 },
  { country: "Nepal", iso2: "NP", currency: "NPR", symbol: "₨", rateFromUsd: 133, decimals: 2 },
  // East Asia
  { country: "China", iso2: "CN", currency: "CNY", symbol: "¥", rateFromUsd: 7.2, decimals: 2 },
  { country: "Japan", iso2: "JP", currency: "JPY", symbol: "¥", rateFromUsd: 149, decimals: 0 },
  { country: "South Korea", iso2: "KR", currency: "KRW", symbol: "₩", rateFromUsd: 1330, decimals: 0 },
  { country: "Hong Kong", iso2: "HK", currency: "HKD", symbol: "HK$", rateFromUsd: 7.8, decimals: 2 },
  { country: "Taiwan", iso2: "TW", currency: "TWD", symbol: "NT$", rateFromUsd: 31, decimals: 2 },
  // Southeast Asia
  { country: "Singapore", iso2: "SG", currency: "SGD", symbol: "S$", rateFromUsd: 1.34, decimals: 2 },
  { country: "Malaysia", iso2: "MY", currency: "MYR", symbol: "RM", rateFromUsd: 4.7, decimals: 2 },
  { country: "Thailand", iso2: "TH", currency: "THB", symbol: "฿", rateFromUsd: 35, decimals: 2 },
  { country: "Indonesia", iso2: "ID", currency: "IDR", symbol: "Rp", rateFromUsd: 15600, decimals: 0 },
  { country: "Philippines", iso2: "PH", currency: "PHP", symbol: "₱", rateFromUsd: 56, decimals: 2 },
  { country: "Vietnam", iso2: "VN", currency: "VND", symbol: "₫", rateFromUsd: 24500, decimals: 0 },
  // Oceania
  { country: "Australia", iso2: "AU", currency: "AUD", symbol: "AU$", rateFromUsd: 1.52, decimals: 2 },
  { country: "New Zealand", iso2: "NZ", currency: "NZD", symbol: "NZ$", rateFromUsd: 1.64, decimals: 2 },
  { country: "Fiji", iso2: "FJ", currency: "FJD", symbol: "FJ$", rateFromUsd: 2.25, decimals: 2 },
  // Africa
  { country: "South Africa", iso2: "ZA", currency: "ZAR", symbol: "R", rateFromUsd: 18.5, decimals: 2 },
  { country: "Nigeria", iso2: "NG", currency: "NGN", symbol: "₦", rateFromUsd: 1500, decimals: 2 },
  { country: "Egypt", iso2: "EG", currency: "EGP", symbol: "E£", rateFromUsd: 49, decimals: 2 },
  { country: "Kenya", iso2: "KE", currency: "KES", symbol: "KSh", rateFromUsd: 129, decimals: 2 },
  { country: "Ghana", iso2: "GH", currency: "GHS", symbol: "GH₵", rateFromUsd: 15, decimals: 2 },
  { country: "Morocco", iso2: "MA", currency: "MAD", symbol: "MAD", rateFromUsd: 10, decimals: 2 },
  { country: "Tanzania", iso2: "TZ", currency: "TZS", symbol: "TSh", rateFromUsd: 2600, decimals: 0 },
  { country: "Uganda", iso2: "UG", currency: "UGX", symbol: "USh", rateFromUsd: 3800, decimals: 0 },
  { country: "Ethiopia", iso2: "ET", currency: "ETB", symbol: "Br", rateFromUsd: 118, decimals: 2 },
  { country: "Tunisia", iso2: "TN", currency: "TND", symbol: "DT", rateFromUsd: 3.1, decimals: 3 },
  { country: "Algeria", iso2: "DZ", currency: "DZD", symbol: "DA", rateFromUsd: 134, decimals: 2 },
  { country: "Zambia", iso2: "ZM", currency: "ZMW", symbol: "ZK", rateFromUsd: 26, decimals: 2 },
];

export const COUNTRY_CURRENCIES: CountryCurrency[] = ENTRIES.map((e) => ({
  ...e,
  flag: flagEmoji(e.iso2),
}));

export const DEFAULT_COUNTRY_CURRENCY = COUNTRY_CURRENCIES[0];

export function findCountry(country: string): CountryCurrency {
  return COUNTRY_CURRENCIES.find((c) => c.country === country) ?? DEFAULT_COUNTRY_CURRENCY;
}

/**
 * Converts a numeric amount from one currency's terms into another's, via
 * their static USD rates (amount / oldRate * newRate). Used to keep the
 * Pricing fields showing a live-converted number when the currency
 * selector changes, instead of a frozen figure.
 */
export function convertBetween(amount: number, from: CountryCurrency, to: CountryCurrency): number {
  const usd = amount / from.rateFromUsd;
  return usd * to.rateFromUsd;
}

export function toUsd(amount: number, from: CountryCurrency): number {
  return amount / from.rateFromUsd;
}

export function formatCurrencyAmount(amount: number, target: CountryCurrency): string {
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: target.decimals,
    maximumFractionDigits: target.decimals,
  });
  return `${target.symbol} ${formatted}`;
}
