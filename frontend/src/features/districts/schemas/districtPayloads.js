const trimOrUndefined = (value) => {
  const trimmed = String(value || "").trim();
  return trimmed || undefined;
};

export const initialDistrictFormValues = {
  name: "",
  code: "",
  region: "",
};

export const districtToFormValues = (district) => ({
  name: district?.name || "",
  code: district?.code || "",
  region: district?.region?._id || district?.region || "",
});

export const validateDistrictForm = (values) => {
  const errors = {};
  if (!trimOrUndefined(values.name) || values.name.trim().length < 2) {
    errors.name = "District name must be at least 2 characters.";
  }
  if (!trimOrUndefined(values.code) || values.code.trim().length < 2) {
    errors.code = "District code must be at least 2 characters.";
  } else if (values.code.trim().length > 20) {
    errors.code = "District code must be 20 characters or fewer.";
  }
  if (!trimOrUndefined(values.region)) {
    errors.region = "A region must be selected.";
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
};

export const pickDistrictPayload = (values) => ({
  name: values.name.trim(),
  code: values.code.trim().toUpperCase(),
  region: values.region,
});
