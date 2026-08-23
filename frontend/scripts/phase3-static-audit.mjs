import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const srcRoot = path.join(root, "src");

const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

const walk = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return walk(fullPath);
      return fullPath;
    }),
  );
  return files.flat();
};

const sourceFiles = (await walk(srcRoot)).filter((file) => /\.(js|jsx)$/.test(file));
const sourceText = await Promise.all(sourceFiles.map(async (file) => [file, await readFile(file, "utf8")]));
const allSource = sourceText.map(([, text]) => text).join("\n");

assert.equal(/dangerouslySetInnerHTML|insertAdjacentHTML|\.innerHTML\s*=/.test(allSource), false, "Unsafe HTML rendering API found.");

const publicProductsApi = await read("src/modules/public/products/api/publicProducts.api.js");
const publicCategoriesApi = await read("src/modules/public/categories/api/publicCategories.api.js");
assert.match(publicProductsApi, /API_ENDPOINTS\.PUBLIC\.PRODUCTS/);
assert.match(publicProductsApi, /API_ENDPOINTS\.PUBLIC\.PRODUCT_DETAIL/);
assert.doesNotMatch(publicProductsApi, /API_ENDPOINTS\.(PRODUCTS|INVENTORY|CATEGORIES)\./);
assert.match(publicCategoriesApi, /API_ENDPOINTS\.PUBLIC\.CATEGORIES/);
assert.doesNotMatch(publicCategoriesApi, /API_ENDPOINTS\.(PRODUCTS|INVENTORY|CATEGORIES)\./);

const publicProductPages = [
  await read("src/modules/public/products/pages/ProductsPage.jsx"),
  await read("src/modules/public/products/pages/ProductDetailsPage.jsx"),
].join("\n");
for (const forbiddenField of ["purchasePrice", "createdBy", "transactionCode", "previousStock", "newStock", "internal remarks"]) {
  assert.equal(publicProductPages.includes(forbiddenField), false, `Public product page references ${forbiddenField}.`);
}

const inventoryApi = await read("src/features/inventory/services/inventoryApi.js");
assert.doesNotMatch(inventoryApi, /apiClient\.(patch|put|delete)\(/, "Inventory service must not directly patch/update/delete stock records.");
assert.match(inventoryApi, /OPENING_STOCK/);
assert.match(inventoryApi, /STOCK_IN/);
assert.match(inventoryApi, /STOCK_OUT/);
assert.match(inventoryApi, /DAMAGED/);

const transactionTable = await read("src/features/inventory/components/InventoryTransactionTable.jsx");
assert.match(transactionTable, /read-only inventory transaction ledger/i);
assert.doesNotMatch(transactionTable, />\s*(Edit|Delete|Overwrite)\s*</i);

const routes = await read("src/routes/SuperAdminRoutes.jsx");
for (const permission of [
  "CATEGORIES_READ",
  "CATEGORIES_MANAGE",
  "PRODUCTS_READ",
  "PRODUCTS_CREATE",
  "PRODUCTS_UPDATE",
  "INVENTORY_READ",
  "INVENTORY_TRANSACTIONS_READ",
]) {
  assert.match(routes, new RegExp(`PERMISSIONS\\.${permission}`), `Missing route permission ${permission}.`);
}

const phase3SearchPages = [
  "src/super-admin/pages/categories/SuperAdminCategoryListPage.jsx",
  "src/super-admin/pages/products/SuperAdminProductListPage.jsx",
  "src/super-admin/pages/inventory/SuperAdminInventoryOverviewPage.jsx",
  "src/super-admin/pages/inventory/SuperAdminInventoryTransactionsPage.jsx",
  "src/super-admin/pages/inventory/SuperAdminLowStockPage.jsx",
  "src/super-admin/pages/inventory/SuperAdminOutOfStockPage.jsx",
  "src/modules/public/products/pages/ProductsPage.jsx",
];
for (const file of phase3SearchPages) {
  const text = await read(file);
  assert.match(text, /useDebouncedValue/, `${file} should debounce search.`);
  assert.match(text, /page:\s*1/, `${file} should reset pagination on filter changes.`);
}

const productImageDisplay = await read("src/features/products/components/ProductImageDisplay.jsx");
assert.match(productImageDisplay, /loading="lazy"/);
assert.match(productImageDisplay, /onError/);

const modal = await read("src/shared/components/Modal.jsx");
assert.match(modal, /aria-modal="true"/);
assert.match(modal, /role="dialog"/);
assert.match(modal, /event\.key [!=]== "Tab"/);

console.log("Phase 3 static audit passed.");
