export function formatCurrency(
  value,
  currency = "HUF",
  { forceDecimals = false, decimals = 2, withSign = false } = {}
) {
  if (value == null || isNaN(value)) return `0 ${currency}`;
  const negative = value < 0;
  const abs = Math.abs(value);
  const useDecimals = forceDecimals || abs % 1 !== 0;
  const formatted = abs.toLocaleString("en-US", {
    minimumFractionDigits: useDecimals ? decimals : 0,
    maximumFractionDigits: useDecimals ? decimals : 0,
  });
  const sign = withSign && negative ? "-" : "";
  return `${sign}${formatted} ${currency}`;
}

export function formatHUF(value, opts) {
  return formatCurrency(value, "HUF", opts);
}

export function formatHUFWithDecimals(value, decimals = 2) {
  return formatCurrency(value, "HUF", { forceDecimals: true, decimals });
}
