import { MEASURE_UNITS, PACK_SIZE_UNIT, PRODUCT_UNIT } from "../constants/index.js";

const LEAD_TYPE_TIERS = ["SUPER_STOCK", "DISTRIBUTOR", "DEALER"];

const isBlank = (value) => String(value ?? "").trim() === "";

const MAX_IMAGES = 10;

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

/**
 * Images are uploaded from the gallery (see ProductImagesField) and kept
 * in the form as { url, publicId }. The first is the primary image.
 */
const toImagePayload = (images = [], productName) =>
  images.slice(0, MAX_IMAGES).map((image, index) => ({
    url: image.url,
    ...(image.publicId ? { publicId: image.publicId } : {}),
    alt: productName ? `${productName} image ${index + 1}` : "",
    isPrimary: index === 0,
  }));

const hasAtMostTwoDecimals = (value) => {
  const text = String(value || "").trim();
  if (!text) return false;
  return /^\d+(\.\d{1,2})?$/.test(text);
};

// Purchase price is deliberately not part of the catalogue form: it is not
// asked when adding a product, and editing a product leaves whatever is
// stored untouched because the field is never sent.
export const initialProductFormValues = {
  name: "",
  category: "",
  brand: "",
  shortDescription: "",
  description: "",
  // Bag, not Kilogram: most of this catalogue is sold by the bag, and a
  // Kilogram default is how a 50 Kg bag's price once got billed per kg.
  unit: PRODUCT_UNIT.BAG,
  sellingPrice: "",
  // One price per kind of buyer. Blank means "no special price" — the
  // standard selling price above applies — which is a different thing
  // from 0, and why these start empty rather than at zero.
  leadTypePrices: { SUPER_STOCK: "", DISTRIBUTOR: "", DEALER: "" },
  // Optional, and blank rather than 0 for the same reason as the tiers.
  mrp: "",
  packSize: { value: "", unit: PACK_SIZE_UNIT.KG },
  taxRate: "0",
  minimumStock: "0",
  images: [],
  specificationsText: "",
};

export const productToFormValues = (product) => ({
  name: product?.name || "",
  category: product?.category?._id || product?.category || "",
  brand: product?.brand || "",
  shortDescription: product?.shortDescription || "",
  description: product?.description || "",
  unit: product?.unit || PRODUCT_UNIT.KG,
  sellingPrice: String(product?.sellingPrice ?? ""),
  leadTypePrices: {
    SUPER_STOCK: product?.leadTypePrices?.SUPER_STOCK == null ? "" : String(product.leadTypePrices.SUPER_STOCK),
    DISTRIBUTOR: product?.leadTypePrices?.DISTRIBUTOR == null ? "" : String(product.leadTypePrices.DISTRIBUTOR),
    DEALER: product?.leadTypePrices?.DEALER == null ? "" : String(product.leadTypePrices.DEALER),
  },
  mrp: product?.mrp == null ? "" : String(product.mrp),
  packSize: {
    value: product?.packSize?.value == null ? "" : String(product.packSize.value),
    unit: product?.packSize?.unit || PACK_SIZE_UNIT.KG,
  },
  taxRate: String(product?.taxRate ?? 0),
  minimumStock: String(product?.minimumStock ?? 0),
  // Primary first, so it keeps its place as the main image.
  images: [...(product?.images || [])]
    .filter((image) => image?.url)
    .sort((a, b) => Number(Boolean(b.isPrimary)) - Number(Boolean(a.isPrimary)))
    .map((image) => ({ url: image.url, publicId: image.publicId || undefined })),
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
  if (!hasAtMostTwoDecimals(values.sellingPrice) || Number(values.sellingPrice) < 0) {
    errors.sellingPrice = "Selling price must be 0 or greater with at most 2 decimal places.";
  }
  // Each tier is optional; a filled one has to be a real price.
  for (const [tier, amount] of Object.entries(values.leadTypePrices || {})) {
    if (String(amount).trim() === "") continue;
    if (!hasAtMostTwoDecimals(amount) || Number(amount) < 0) {
      errors[`leadTypePrices.${tier}`] = "Enter a price of 0 or more, with at most 2 decimal places.";
    }
  }
  if (!isBlank(values.mrp)) {
    if (!hasAtMostTwoDecimals(values.mrp) || Number(values.mrp) < 0) {
      errors.mrp = "MRP must be 0 or greater with at most 2 decimal places.";
    } else {
      // Mirrors the server's rule, so the mistake shows on the box that
      // has it instead of as one message after submitting.
      const mrp = Number(values.mrp);
      if (!errors.sellingPrice && Number(values.sellingPrice) > mrp) {
        errors.sellingPrice = "Selling price cannot be more than the MRP.";
      }
      for (const tier of LEAD_TYPE_TIERS) {
        const amount = values.leadTypePrices?.[tier];
        if (!isBlank(amount) && !errors[`leadTypePrices.${tier}`] && Number(amount) > mrp) {
          errors[`leadTypePrices.${tier}`] = "Cannot be more than the MRP.";
        }
      }
    }
  }
  if (!isBlank(values.packSize?.value)) {
    const packValue = Number(values.packSize.value);
    if (!Number.isFinite(packValue) || packValue <= 0 || packValue > 100000) {
      errors["packSize.value"] = "Pack size must be a number greater than 0.";
    } else if (!Object.values(PACK_SIZE_UNIT).includes(values.packSize.unit)) {
      errors["packSize.value"] = "Select a unit for the pack size.";
    } else if (!errors.unit && MEASURE_UNITS.includes(values.unit)) {
      // Prices are per selling unit, so "per Kilogram" with a 50 Kg pack
      // would bill the bag's price for every kilogram. Shown on the
      // Selling Unit box, since that is the one to change.
      errors.unit = "With a pack size, choose Bag, Packet, Bottle, Box or Piece — prices are per this unit.";
    }
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

  if ((values.images || []).length > MAX_IMAGES) {
    errors.images = `A product may have at most ${MAX_IMAGES} images.`;
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

  return {
    name: values.name.trim(),
    category: values.category,
    ...(trimOrUndefined(values.brand) ? { brand: values.brand.trim() } : {}),
    ...(trimOrUndefined(values.shortDescription)
      ? { shortDescription: values.shortDescription.trim() }
      : {}),
    ...(trimOrUndefined(values.description) ? { description: values.description.trim() } : {}),
    unit: values.unit,
    sellingPrice: Number(values.sellingPrice),
    // Always sent, every tier, so emptying a box actually clears that
    // tier back to the standard price instead of leaving the old one
    // behind — `null` is what the API reads as "no special price".
    // Both always sent, like the tiers, so emptying the box on an edit
    // clears the stored value instead of leaving the old one behind.
    mrp: isBlank(values.mrp) ? null : Number(values.mrp),
    packSize: isBlank(values.packSize?.value)
      ? { value: null, unit: null }
      : { value: Number(values.packSize.value), unit: values.packSize.unit },
    leadTypePrices: Object.fromEntries(
      LEAD_TYPE_TIERS.map((tier) => [
        tier,
        String(values.leadTypePrices?.[tier] ?? "").trim() === ""
          ? null
          : Number(values.leadTypePrices[tier]),
      ]),
    ),
    taxRate: Number(values.taxRate || 0),
    minimumStock: Number(values.minimumStock || 0),
    // Always sent, so removing every photo while editing actually removes them.
    images: toImagePayload(values.images, values.name.trim()),
    ...(Object.keys(specifications).length ? { specifications } : {}),
  };
};
