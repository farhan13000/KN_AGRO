const defaultCurrencyFormatter = new Intl.NumberFormat("en-IN", {
  currency: "INR",
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
  style: "currency",
});

export const formatMoney = (value, formatter = defaultCurrencyFormatter) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return formatter.format(0);
  return formatter.format(amount);
};
