const trimOrUndefined = (value) => {
  const trimmed = String(value || "").trim();
  return trimmed || undefined;
};

export const initialRegionFormValues = {
  name: "",
  code: "",
  description: "",
};

export const regionToFormValues = (region) => ({
  name: region?.name || "",
  code: region?.code || "",
  description: region?.description || "",
});

export const validateRegionForm = (values) => {
  const errors = {};
  if (!trimOrUndefined(values.name) || values.name.trim().length < 2) {
    errors.name = "Region name must be at least 2 characters.";
  }
  if (!trimOrUndefined(values.code) || values.code.trim().length < 2) {
    errors.code = "Region code must be at least 2 characters.";
  } else if (values.code.trim().length > 20) {
    errors.code = "Region code must be 20 characters or fewer.";
  }
  if (values.description && values.description.trim().length > 1000) {
    errors.description = "Description must be 1000 characters or fewer.";
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
};

export const pickRegionPayload = (values) => ({
  name: values.name.trim(),
  code: values.code.trim().toUpperCase(),
  ...(trimOrUndefined(values.description) ? { description: values.description.trim() } : {}),
});
