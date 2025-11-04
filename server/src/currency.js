// Static, hardcoded rates (didn't find a free reliable API without auth)
export const FX_RATES = {
  HUF: 1,
  EUR: 0.00255,
  USD: 0.0027,
  GBP: 0.00215,
  JPY: 0.4,
};

export function convertFromHUF(amountHUF, targetCurrency) {
  if (typeof amountHUF !== "number") return 0;
  if (!targetCurrency || !FX_RATES[targetCurrency]) return amountHUF;
  const rate = FX_RATES[targetCurrency];
  return amountHUF * rate;
}

export function roundCurrency(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
