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

const quotationsRoot = path.join(srcRoot, "features", "quotations");
const quotationFiles = (await walk(quotationsRoot)).filter((file) => /\.(js|jsx)$/.test(file));
const quotationSource = await Promise.all(quotationFiles.map(async (file) => [file, await readFile(file, "utf8")]));
const allQuotationSource = quotationSource.map(([, text]) => text).join("\n");

// Prompt 53 — no unsafe HTML injection, no debug output, no hard-delete or
// premature Order-creation surface anywhere in the feature.
assert.equal(
  /dangerouslySetInnerHTML|insertAdjacentHTML|\.innerHTML\s*=/.test(allQuotationSource),
  false,
  "Unsafe HTML rendering API found in features/quotations.",
);
assert.equal(
  /console\.(log|debug|info|warn|error)/.test(allQuotationSource),
  false,
  "Debug console output found in features/quotations.",
);
assert.equal(
  /deleteQuotation|DELETE_QUOTATION/.test(allQuotationSource),
  false,
  "No hard-delete surface should exist for quotations — lifecycle/status operations only.",
);
assert.equal(
  /createOrder|convertToOrder|ORDER_CREATE/i.test(allQuotationSource),
  false,
  "Phase 5 must never create Orders — that begins in Phase 6.",
);

// Prompt 40 — every payload builder is a real whitelist, never a spread of
// a raw form/record object.
const payloads = await read("src/features/quotations/schemas/quotationPayloads.js");
assert.equal(/\.\.\.(values|quotation)\b/.test(payloads), false, "Payload builders must never spread a raw object.");
for (const forbidden of [
  "quotationNumber:",
  "grandTotal:",
  "subtotal:",
  "createdBy:",
  "sentAt:",
  "acceptedAt:",
  "rejectedAt:",
  "convertedAt:",
]) {
  assert.equal(payloads.includes(forbidden), false, `quotationPayloads.js must never assign the server-owned field ${forbidden}`);
}

// Prompt 24 / 43 — saved quotation rendering must never re-fetch or re-read
// live Product data; every field comes from the item's own snapshot.
for (const file of [
  "src/features/quotations/components/QuotationItemTable.jsx",
  "src/features/quotations/components/QuotationDetailView.jsx",
  "src/features/quotations/components/QuotationPrintView.jsx",
]) {
  const text = await read(file);
  assert.doesNotMatch(text, /getProductById|useProductDetail/, `${file} must render only saved snapshot fields, never a live Product lookup.`);
}

// Prompt 44 — Send's Lead-status side effect must only ever be observed by
// refetching the quotation, never patched directly by the frontend.
assert.equal(
  /leadApi\.(changeStatus|updateLead)/.test(allQuotationSource),
  false,
  "features/quotations must never directly mutate Lead status — that is a Send side effect owned by the backend.",
);

// Prompt 45 / 46 — lifecycle actions must be capability-driven, not
// individual scattered hasPermission/PERMISSIONS checks in JSX.
const lifecycleActions = await read("src/features/quotations/components/QuotationLifecycleActions.jsx");
assert.match(lifecycleActions, /getQuotationCapabilities/);
assert.doesNotMatch(lifecycleActions, /PERMISSIONS\.QUOTATIONS_(READ|CREATE|UPDATE|SEND|ACCEPT|REJECT|MANAGE)\b/);

const listView = await read("src/features/quotations/components/QuotationListView.jsx");
assert.match(listView, /getQuotationCapabilities/);
// Prompt 46 fix regression guard: no role List page should need to pass a
// `showCreate` flag by hand — QuotationListView derives it itself from the
// real permission (a local variable of that name inside the component is
// fine; the point is role pages don't own this decision).
for (const file of [
  "src/super-admin/pages/quotations/SuperAdminQuotationListPage.jsx",
  "src/sales-manager/pages/quotations/SalesManagerQuotationListPage.jsx",
  "src/employee/pages/quotations/EmployeeQuotationListPage.jsx",
]) {
  const text = await read(file);
  assert.doesNotMatch(text, /showCreate/, `${file} should not pass showCreate — QuotationListView derives it from the real permission.`);
}

// Prompt 50 — every lifecycle mutation must resync on failure, not just success.
assert.match(lifecycleActions, /onError:[\s\S]{0,80}?onSuccess\?\.\(\)/, "Mutations must refetch on error too (Prompt 50 conflict UX).");

// Prompt 5 — the API service must route every call through the centralized
// endpoint map, never a raw path string.
const quotationApi = await read("src/features/quotations/services/quotationApi.js");
assert.match(quotationApi, /API_ENDPOINTS\.QUOTATIONS\.BASE/);
assert.match(quotationApi, /API_ENDPOINTS\.LEADS\.QUOTATIONS/);
assert.doesNotMatch(quotationApi, /apiClient\.(get|post|patch|delete)\(\s*["'`]\//, "quotationApi.js must never hit a raw path string.");

// Prompt 61 — search inputs across the feature must be debounced, and list
// pagination must reset to page 1 on filter changes.
for (const file of [
  "src/features/quotations/components/QuotationListView.jsx",
  "src/features/quotations/components/QuotationLeadSelector.jsx",
  "src/features/quotations/components/QuotationProductSelector.jsx",
]) {
  const text = await read(file);
  assert.match(text, /useDebouncedValue/, `${file} should debounce search.`);
}
assert.match(listView, /page:\s*1/, "QuotationListView should reset pagination on filter changes.");

// Prompt 45 / 48 — every quotation route across all three roles must be
// permission-gated with the exact permission matching that endpoint.
const routes = [
  await read("src/routes/SuperAdminRoutes.jsx"),
  await read("src/routes/SalesManagerRoutes.jsx"),
  await read("src/routes/EmployeeRoutes.jsx"),
].join("\n");
for (const permission of [
  "QUOTATIONS_READ",
  "QUOTATIONS_CREATE",
  "QUOTATIONS_UPDATE",
]) {
  assert.match(routes, new RegExp(`PERMISSIONS\\.${permission}`), `Missing quotation route permission ${permission}.`);
}
assert.doesNotMatch(routes, /QUOTATIONS_MANAGE/, "Cancel is an in-page action gated by capability, not a route-level permission.");

console.log("Phase 5 static audit passed.");
