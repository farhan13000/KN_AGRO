import assert from "node:assert/strict";

import {
  initialProductFormValues,
  pickProductPayload,
  validateProductForm,
} from "../src/features/products/schemas/productPayloads.js";
import { getProductStatusLabel, getProductUnitLabel } from "../src/features/products/utils/productFormatters.js";
import {
  initialInventoryMovementValues,
  pickInventoryMovementPayload,
  validateInventoryMovementForm,
} from "../src/features/inventory/schemas/inventoryMovementPayloads.js";
import { deriveStockStatus } from "../src/features/inventory/utils/inventoryFormatters.js";
import { validateCategoryForm } from "../src/features/categories/schemas/categoryPayloads.js";

const assertValid = (result) => assert.equal(result.isValid, true, JSON.stringify(result.errors));
const assertInvalidField = (result, field) => {
  assert.equal(result.isValid, false);
  assert.ok(result.errors[field], `Expected ${field} error`);
};

assert.equal(getProductStatusLabel("ACTIVE"), "Active");
assert.equal(getProductStatusLabel("DISCONTINUED"), "Discontinued");
assert.equal(getProductUnitLabel("KG"), "Kilogram");
assert.equal(getProductUnitLabel("LITRE"), "Litre");

assert.equal(deriveStockStatus({ availableStock: 20, minimumStock: 5 }), "IN_STOCK");
assert.equal(deriveStockStatus({ availableStock: 5, minimumStock: 5 }), "LOW_STOCK");
assert.equal(deriveStockStatus({ availableStock: 0, minimumStock: 5 }), "OUT_OF_STOCK");

const validProduct = {
  ...initialProductFormValues,
  name: "Neem Growth Booster",
  category: "category-1",
  purchasePrice: "100.50",
  sellingPrice: "120.75",
  taxRate: "5",
  minimumStock: "10",
  imagesText: "https://example.com/product.png",
  specificationsText: "Pack Size: 1 litre\nApplication: Foliar spray",
};
assertValid(validateProductForm(validProduct));

assertInvalidField(validateProductForm({ ...validProduct, imagesText: "javascript:alert(1)" }), "imagesText");
assertInvalidField(validateProductForm({ ...validProduct, sellingPrice: "10.999" }), "sellingPrice");
assertInvalidField(validateProductForm({ ...validProduct, minimumStock: "2.5" }), "minimumStock");

const productPayload = pickProductPayload({
  ...validProduct,
  productCode: "SHOULD-NOT-SEND",
  currentStock: 99,
  createdBy: "user-1",
});
assert.deepEqual(Object.keys(productPayload).sort(), [
  "category",
  "images",
  "minimumStock",
  "name",
  "purchasePrice",
  "sellingPrice",
  "specifications",
  "taxRate",
  "unit",
]);
assert.equal(productPayload.images[0].url, "https://example.com/product.png");

assertValid(validateInventoryMovementForm({ ...initialInventoryMovementValues, quantity: "1", reason: "Opening stock" }));
assertInvalidField(validateInventoryMovementForm({ quantity: "0", reason: "Bad zero", remarks: "" }), "quantity");
assertInvalidField(validateInventoryMovementForm({ quantity: "-1", reason: "Bad negative", remarks: "" }), "quantity");
assertInvalidField(validateInventoryMovementForm({ quantity: "2", reason: "", remarks: "" }), "reason");
assertInvalidField(
  validateInventoryMovementForm({ quantity: "1000001", reason: "Too large", remarks: "" }),
  "quantity",
);
assertInvalidField(
  validateInventoryMovementForm(
    { quantity: "9", reason: "Above displayed stock", remarks: "" },
    { availableStock: 5, blockWhenAboveAvailable: true },
  ),
  "quantity",
);

const movementPayload = pickInventoryMovementPayload({
  quantity: "3",
  reason: "Manual correction",
  remarks: "Cycle count",
  currentStock: 10,
  transactionCode: "SHOULD-NOT-SEND",
});
assert.deepEqual(Object.keys(movementPayload).sort(), ["quantity", "reason", "remarks"]);

assertValid(validateCategoryForm({ name: "Organic Fertilizers", slug: "organic-fertilizers", image: "https://example.com/category.jpg", sortOrder: "0" }));
assertInvalidField(validateCategoryForm({ name: "Organic Fertilizers", slug: "", image: "data:text/html,evil", sortOrder: "0" }), "image");

console.log("Phase 3 unit checks passed.");
