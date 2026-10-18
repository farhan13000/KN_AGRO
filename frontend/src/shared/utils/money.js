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

// Printed documents always show paise: "₹519.20", "₹1,800.00", the way a
// real bill reads. Screens keep the shorter default above.
const documentCurrencyFormatter = new Intl.NumberFormat("en-IN", {
  currency: "INR",
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  style: "currency",
});

export const formatDocumentMoney = (value) => formatMoney(value, documentCurrencyFormatter);
