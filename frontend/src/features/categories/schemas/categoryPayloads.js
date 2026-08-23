const trimOrUndefined = (value) => {
  const trimmed = String(value || "").trim();
  return trimmed || undefined;
};

const isSafeHttpUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

export const initialCategoryFormValues = {
  name: "",
  slug: "",
  description: "",
  image: "",
  sortOrder: "0",
};

export const categoryToFormValues = (category) => ({
  name: category?.name || "",
  slug: category?.slug || "",
  description: category?.description || "",
  image: category?.image || "",
  sortOrder: String(category?.sortOrder ?? 0),
});

export const validateCategoryForm = (values) => {
  const errors = {};
  if (!trimOrUndefined(values.name) || values.name.trim().length < 2) {
    errors.name = "Category name must be at least 2 characters.";
  }
  if (values.slug && values.slug.trim().length < 2) {
    errors.slug = "Slug must be at least 2 characters.";
  }
  if (values.image && !isSafeHttpUrl(values.image.trim())) {
    errors.image = "Image must be a valid URL.";
  }
  if (Number(values.sortOrder) < 0 || !Number.isInteger(Number(values.sortOrder))) {
    errors.sortOrder = "Sort order must be a whole number 0 or greater.";
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
};

export const pickCategoryPayload = (values) => ({
  name: values.name.trim(),
  ...(trimOrUndefined(values.slug) ? { slug: values.slug.trim() } : {}),
  ...(trimOrUndefined(values.description) ? { description: values.description.trim() } : {}),
  ...(trimOrUndefined(values.image) ? { image: values.image.trim() } : {}),
  sortOrder: Number(values.sortOrder || 0),
});
