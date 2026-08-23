export const initialInventoryMovementValues = {
  quantity: "",
  reason: "",
  remarks: "",
};

const trimOrUndefined = (value) => {
  const trimmed = String(value || "").trim();
  return trimmed || undefined;
};

export const validateInventoryMovementForm = (
  values,
  { availableStock, blockWhenAboveAvailable = false } = {},
) => {
  const errors = {};
  const warnings = {};
  const quantity = Number(values.quantity);

  if (!Number.isFinite(quantity) || quantity <= 0) {
    errors.quantity = "Quantity must be greater than 0.";
  } else if (quantity > 1_000_000) {
    errors.quantity = "Quantity exceeds the backend maximum.";
  } else if (
    Number.isFinite(Number(availableStock)) &&
    quantity > Number(availableStock)
  ) {
    const message =
      "Quantity is above the displayed available stock. The backend will validate the latest stock before saving.";
    if (blockWhenAboveAvailable) errors.quantity = "Quantity cannot exceed displayed available stock.";
    else warnings.quantity = message;
  }

  if (!trimOrUndefined(values.reason)) {
    errors.reason = "Reason is required.";
  } else if (values.reason.trim().length > 300) {
    errors.reason = "Reason must be 300 characters or fewer.";
  }

  if (values.remarks && values.remarks.trim().length > 1000) {
    errors.remarks = "Remarks must be 1000 characters or fewer.";
  }

  return { errors, isValid: Object.keys(errors).length === 0, warnings };
};

export const pickInventoryMovementPayload = (values) => ({
  quantity: Number(values.quantity),
  reason: values.reason.trim(),
  ...(trimOrUndefined(values.remarks) ? { remarks: values.remarks.trim() } : {}),
});
