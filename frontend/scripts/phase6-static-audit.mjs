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

const FEATURES = ["customers", "orders", "invoices", "payments"];

// Strips `//` line comments only (good enough for this codebase's style —
// no `/* */` block comments are used anywhere in Phase 6 source). Needed
// because several prose gateway-term words (checkout/gateway/webhook/
// payment intent) legitimately appear in comments that document their
// *absence* (see paymentApi.js's own header comment) — matching the raw
// source would false-positive on the very comment proving compliance.
const stripLineComments = (text) =>
  text
    .split("\n")
    .map((line) => line.replace(/\/\/.*$/, ""))
    .join("\n");

const featureSource = {};
const featureSourceNoComments = {};
for (const feature of FEATURES) {
  const files = (await walk(path.join(srcRoot, "features", feature))).filter((file) => /\.(js|jsx)$/.test(file));
  const contents = await Promise.all(files.map((file) => readFile(file, "utf8")));
  featureSource[feature] = contents.join("\n");
  featureSourceNoComments[feature] = stripLineComments(featureSource[feature]);
}
const allPhase6Source = Object.values(featureSource).join("\n");
const allPhase6SourceNoComments = Object.values(featureSourceNoComments).join("\n");

// Prompt 71/77 — no payment gateway code anywhere in Phase 6. Checked
// against comment-stripped source specifically so the many correct
// "we do NOT implement X" documentation comments (which necessarily name
// the very terms being excluded) don't trip this check themselves.
assert.doesNotMatch(
  allPhase6SourceNoComments,
  /razorpay|stripe|cashfree|payu|createCheckout|paymentIntent|verifyGatewayPayment|handlePaymentWebhook/i,
  "No payment gateway code should exist anywhere in Phase 6 — manual recording only.",
);

// Prompt 77 — no debug logging of financial/customer data.
assert.doesNotMatch(
  allPhase6Source,
  /console\.(log|debug|info|warn|error)/,
  "No console output should exist anywhere in the four Phase 6 features.",
);

// Prompt 77 — no unsafe HTML injection.
assert.doesNotMatch(
  allPhase6Source,
  /dangerouslySetInnerHTML|insertAdjacentHTML|\.innerHTML\s*=/,
  "Unsafe HTML rendering API found in Phase 6 features.",
);

// Prompt 65/77 — no direct inventory mutation from Orders/Invoices/Payments/
// Customers; Order actions must use their own dedicated endpoints only.
assert.doesNotMatch(
  allPhase6Source,
  /inventoryApi\.(stockIn|stockOut|adjustStock|adjustStockIn|adjustStockOut|markDamagedStock|createOpeningStock)\b/,
  "Phase 6 must never directly mutate Inventory — only Order lifecycle actions may change stock, and only via their own endpoints.",
);

// Prompt 77 — no hard-delete surface anywhere (no DELETE route exists for
// any of the four Phase 6 models).
for (const feature of FEATURES) {
  assert.doesNotMatch(
    featureSource[feature],
    /apiClient\.delete\(/,
    `features/${feature} must never call a DELETE endpoint — no hard-delete exists for this domain.`,
  );
}

// --- Prompt 64: payload builders are real whitelists, never a raw spread -

const payloadFiles = {
  customers: "src/features/customers/schemas/customerPayloads.js",
  orders: "src/features/orders/schemas/orderPayloads.js",
  invoices: "src/features/invoices/schemas/invoicePayloads.js",
  payments: "src/features/payments/schemas/paymentPayloads.js",
};
const serverOwnedFieldsByFeature = {
  customers: ["customerCode:", "createdBy:", "updatedBy:", "blockReason:"],
  orders: ["orderNumber:", "reservedStock:", "grandTotal:", "createdBy:"],
  invoices: ["invoiceNumber:", "paidAmount:", "dueAmount:", "paymentStatus:", "grandTotal:"],
  payments: ["paymentNumber:", "recordedBy:", "recordedByEmployee:", "paidAmount:", "dueAmount:"],
};
for (const [feature, file] of Object.entries(payloadFiles)) {
  const text = await read(file);
  assert.doesNotMatch(text, /\.\.\.(values|customer|order|invoice|payment)\b/, `${file} must never spread a raw object.`);
  for (const forbidden of serverOwnedFieldsByFeature[feature]) {
    assert.equal(text.includes(forbidden), false, `${file} must never assign the server-owned field ${forbidden}`);
  }
}

// --- Prompt 69: snapshot renderers must never read live Product/Customer -

const snapshotFiles = [
  "src/features/orders/components/OrderItemTable.jsx",
  "src/features/orders/components/OrderPrintView.jsx",
  "src/features/invoices/components/InvoiceItemTable.jsx",
  "src/features/invoices/components/InvoiceAddressSnapshotSection.jsx",
  "src/features/invoices/components/InvoicePrintView.jsx",
];
for (const file of snapshotFiles) {
  const text = await read(file);
  assert.doesNotMatch(
    text,
    /useProductDetail|useCustomerDetail|productApi\.|customerApi\./,
    `${file} must render only saved snapshot fields, never a live Product/Customer lookup.`,
  );
}

// --- Prompt 62: capability functions used, not scattered raw permission --
// checks in JSX (Do not scatter role checks).

const capabilityGuards = [
  {
    file: "src/features/orders/components/OrderLifecycleActions.jsx",
    usesCapability: /getOrderCapabilities/,
    forbiddenRaw: /PERMISSIONS\.ORDERS_(CONFIRM|FULFILL|CANCEL)\b/,
  },
  {
    file: "src/features/invoices/components/InvoiceLifecycleActions.jsx",
    usesCapability: /getInvoiceCapabilities/,
    forbiddenRaw: /PERMISSIONS\.INVOICES_(ISSUE|CANCEL)\b/,
  },
  {
    file: "src/features/customers/components/CustomerListView.jsx",
    usesCapability: /getCustomerCapabilities/,
    forbiddenRaw: /PERMISSIONS\.CUSTOMERS_CREATE\b/,
  },
  {
    file: "src/features/customers/components/CustomerDetailView.jsx",
    usesCapability: /getCustomerCapabilities/,
    forbiddenRaw: /PERMISSIONS\.CUSTOMERS_UPDATE\b/,
  },
  {
    file: "src/features/orders/components/OrderInvoiceSection.jsx",
    usesCapability: /getOrderCapabilities/,
    forbiddenRaw: /PERMISSIONS\.INVOICES_CREATE\b/,
  },
];
for (const { file, usesCapability, forbiddenRaw } of capabilityGuards) {
  const text = await read(file);
  assert.match(text, usesCapability, `${file} should derive its permission-driven UI from the shared capability function.`);
  assert.doesNotMatch(text, forbiddenRaw, `${file} should not scatter its own raw PERMISSIONS check — Prompt 62.`);
}

// --- Prompt 50/68: every lifecycle mutation refetches on error too -------

for (const file of [
  "src/features/orders/components/OrderLifecycleActions.jsx",
  "src/features/invoices/components/InvoiceLifecycleActions.jsx",
  "src/features/payments/components/RecordPaymentAction.jsx",
]) {
  const text = await read(file);
  assert.match(text, /onError:[\s\S]{0,120}?on(Success|Recorded)\?\.\(\)/, `${file} must refetch on error too, not just success (Prompt 36/68).`);
}

// --- Prompt 5: every API service routes through the centralized endpoint -
// map, never a raw path string.

for (const file of [
  "src/features/customers/services/customerApi.js",
  "src/features/orders/services/orderApi.js",
  "src/features/invoices/services/invoiceApi.js",
  "src/features/payments/services/paymentApi.js",
]) {
  const text = await read(file);
  assert.doesNotMatch(text, /apiClient\.(get|post|patch|delete)\(\s*["'`]\//, `${file} must never hit a raw path string.`);
}

// --- Prompt 73: search inputs debounced across every list ----------------

for (const file of [
  "src/features/customers/components/CustomerListView.jsx",
  "src/features/orders/components/OrderListView.jsx",
  "src/features/invoices/components/InvoiceListView.jsx",
  "src/features/payments/components/PaymentListView.jsx",
]) {
  const text = await read(file);
  assert.match(text, /useDebouncedValue/, `${file} should debounce search (Prompt 73).`);
  assert.match(text, /page:\s*1/, `${file} should reset pagination to page 1 on filter change (Prompt 73).`);
}

// --- Prompt 75: every real (non-print) table wraps in overflow-x-auto ----

for (const file of [
  "src/features/customers/components/CustomerTable.jsx",
  "src/features/orders/components/OrderTable.jsx",
  "src/features/orders/components/OrderItemTable.jsx",
  "src/features/invoices/components/InvoiceTable.jsx",
  "src/features/invoices/components/InvoiceItemTable.jsx",
  "src/features/payments/components/PaymentTable.jsx",
]) {
  const text = await read(file);
  assert.match(text, /overflow-x-auto/, `${file} should wrap its table in an overflow-x-auto container (Prompt 75).`);
}

// --- Prompt 72: Order/Invoice Detail RouteViews gate the full-page loader
// on "loading AND no data yet", not bare isLoading — regression guard for
// the loading-flash fix (Batch 8).

for (const file of [
  "src/features/orders/components/OrderDetailRouteView.jsx",
  "src/features/invoices/components/InvoiceDetailRouteView.jsx",
]) {
  const text = await read(file);
  assert.match(
    text,
    /isLoading\s*&&\s*!(order|invoice)\b/,
    `${file} must gate its full-page loader on "isLoading && !data", not bare isLoading (Prompt 72 regression guard).`,
  );
}

// --- Prompt 74: business-timezone date helper used for date-input bounds,
// never a raw UTC toISOString() (regression guard for Batch 8's fix).

for (const file of [
  "src/features/payments/forms/RecordPaymentForm.jsx",
  "src/features/quotations/components/QuotationLifecycleActions.jsx",
]) {
  const text = await read(file);
  assert.doesNotMatch(text, /new Date\(\)\.toISOString\(\)/, `${file} must use getBusinessDateKey, not a raw UTC toISOString(), for date-input bounds (Prompt 74).`);
}

// --- Prompt 60: every Phase 6 route across all three roles is permission-
// gated, and the deliberately-absent Payment Detail route never appears.

const routeSource = [
  await read("src/routes/SuperAdminRoutes.jsx"),
  await read("src/routes/SalesManagerRoutes.jsx"),
  await read("src/routes/EmployeeRoutes.jsx"),
].join("\n");
for (const permission of [
  "CUSTOMERS_READ",
  "CUSTOMERS_CREATE",
  "CUSTOMERS_UPDATE",
  "ORDERS_READ",
  "INVOICES_READ",
  "PAYMENTS_READ",
]) {
  assert.match(routeSource, new RegExp(`PERMISSIONS\\.${permission}`), `Missing Phase 6 route permission ${permission}.`);
}
assert.doesNotMatch(routeSource, /PAYMENT_DETAIL/, "No Payment Detail route should exist — no backend endpoint for it (Prompt 49).");

console.log("Phase 6 static audit passed.");
