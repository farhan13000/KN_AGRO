import { PRODUCT_UNIT } from "../constants/index.js";

const trimOrUndefined = (value) => {
  const trimmed = String(value || "").trim();
  return trimmed || undefined;
};

const parseSpecifications = (value) => {
  const lines = String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return Object.fromEntries(
    lines
      .map((line) => {
        const [key, ...rest] = line.split(":");
        return [key?.trim(), rest.join(":").trim()];
      })
      .filter(([key, specValue]) => key && specValue),
  );
};

const stringifySpecifications = (specifications = {}) =>
  Object.entries(specifications)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");

const parseImages = (value, productName) =>
  String(value || "")
    .split("\n")
    .map((url) => url.trim())
    .filter(Boolean)
    .map((url, index) => ({
      url,
      alt: productName ? `${productName} image ${index + 1}` : "",
      isPrimary: index === 0,
    }));

const hasAtMostTwoDecimals = (value) => {
  const text = String(value || "").trim();
  if (!text) return false;
  return /^\d+(\.\d{1,2})?$/.test(text);
};

const isSafeHttpUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

export const initialProductFormValues = {
  name: "",
  category: "",
  brand: "",
  shortDescription: "",
  description: "",
  unit: PRODUCT_UNIT.KG,
  purchasePrice: "",
  sellingPrice: "",
  taxRate: "0",
  minimumStock: "0",
  imagesText: "",
  specificationsText: "",
};

export const productToFormValues = (product) => ({
  name: product?.name || "",
  category: product?.category?._id || product?.category || "",
  brand: product?.brand || "",
  shortDescription: product?.shortDescription || "",
  description: product?.description || "",
  unit: product?.unit || PRODUCT_UNIT.KG,
  purchasePrice: String(product?.purchasePrice ?? ""),
  sellingPrice: String(product?.sellingPrice ?? ""),
  taxRate: String(product?.taxRate ?? 0),
  minimumStock: String(product?.minimumStock ?? 0),
  imagesText: (product?.images || []).map((image) => image.url).filter(Boolean).join("\n"),
  specificationsText: stringifySpecifications(product?.specifications || {}),
});

export const validateProductForm = (values) => {
  const errors = {};
  if (!trimOrUndefined(values.name) || values.name.trim().length < 2) {
    errors.name = "Product name must be at least 2 characters.";
  } else if (values.name.trim().length > 150) {
    errors.name = "Product name must be 150 characters or fewer.";
  }
  if (!trimOrUndefined(values.category)) {
    errors.category = "Category is required.";
  }
  if (values.brand && values.brand.trim().length > 100) {
    errors.brand = "Brand must be 100 characters or fewer.";
  }
  if (values.shortDescription && values.shortDescription.trim().length > 300) {
    errors.shortDescription = "Short description must be 300 characters or fewer.";
  }
  if (values.description && values.description.trim().length > 3000) {
    errors.description = "Description must be 3000 characters or fewer.";
  }
  if (!Object.values(PRODUCT_UNIT).includes(values.unit)) {
    errors.unit = "Select a valid unit.";
  }
  if (!hasAtMostTwoDecimals(values.purchasePrice) || Number(values.purchasePrice) < 0) {
    errors.purchasePrice = "Purchase price must be 0 or greater with at most 2 decimal places.";
  }
  if (!hasAtMostTwoDecimals(values.sellingPrice) || Number(values.sellingPrice) < 0) {
    errors.sellingPrice = "Selling price must be 0 or greater with at most 2 decimal places.";
  }
  if (!Number.isFinite(Number(values.taxRate)) || Number(values.taxRate) < 0 || Number(values.taxRate) > 100) {
    errors.taxRate = "Tax rate must be between 0 and 100.";
  }
  if (
    !Number.isFinite(Number(values.minimumStock)) ||
    Number(values.minimumStock) < 0 ||
    !Number.isInteger(Number(values.minimumStock))
  ) {
    errors.minimumStock = "Minimum stock must be a whole number 0 or greater.";
  }

  const imageUrls = String(values.imagesText || "")
    .split("\n")
    .map((url) => url.trim())
    .filter(Boolean);
  const invalidImage = imageUrls.find((url) => !isSafeHttpUrl(url));
  if (invalidImage) {
    errors.imagesText = "Each image must be a valid URL.";
  } else if (imageUrls.length > 10) {
    errors.imagesText = "A product may have at most 10 images.";
  }

  const specificationLines = String(values.specificationsText || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const invalidSpecification = specificationLines.find((line) => {
    const [key, ...rest] = line.split(":");
    const specValue = rest.join(":").trim();
    return !key?.trim() || key.trim().length > 100 || !specValue || specValue.length > 500;
  });
  if (invalidSpecification) {
    errors.specificationsText =
      "Specifications must use Key: Value lines with keys up to 100 characters and values up to 500 characters.";
  } else if (specificationLines.length > 50) {
    errors.specificationsText = "A product may have at most 50 specification fields.";
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
};

export const pickProductPayload = (values) => {
  const specifications = parseSpecifications(values.specificationsText);
  const images = parseImages(values.imagesText, values.name);

  return {
    name: values.name.trim(),
    category: values.category,
    ...(trimOrUndefined(values.brand) ? { brand: values.brand.trim() } : {}),
    ...(trimOrUndefined(values.shortDescription)
      ? { shortDescription: values.shortDescription.trim() }
      : {}),
    ...(trimOrUndefined(values.description) ? { description: values.description.trim() } : {}),
    unit: values.unit,
    purchasePrice: Number(values.purchasePrice),
    sellingPrice: Number(values.sellingPrice),
    taxRate: Number(values.taxRate || 0),
    minimumStock: Number(values.minimumStock || 0),
    ...(images.length ? { images } : {}),
    ...(Object.keys(specifications).length ? { specifications } : {}),
  };
};
