/**
 * Currency formatting. Vellum prices are stored as integer minor units
 * (paise for INR). We never compute on floats — divide only at the
 * presentation boundary.
 *
 * Field names in the DB still read `…FeeCents` / `totalCents` for legacy
 * reasons; semantically they are minor currency units (paise).
 */

const INR_FORMATTER = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const INR_FORMATTER_2DP = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format paise as ₹X,XXX (whole rupees, no decimals). */
export function formatINR(paise: number): string {
  return INR_FORMATTER.format(paise / 100);
}

/** Format paise as ₹X,XXX.XX (two-decimal precision). */
export function formatINR2(paise: number): string {
  return INR_FORMATTER_2DP.format(paise / 100);
}
