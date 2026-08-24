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

const publicFiles = [
  "src/modules/public/enquiries/api/publicEnquiries.api.js",
  "src/modules/public/enquiries/components/EnquiryForm.jsx",
  "src/modules/public/contact/components/ContactForm.jsx",
].map((file) => [file, ""]);
for (const [file] of publicFiles) {
  const text = await read(file);
  for (const forbidden of [
    "assignedManager",
    "assignedEmployee",
    "expectedValue",
    "createdBy",
    "leadCode",
    "lostReason",
    "convertedAt",
    "closedAt",
  ]) {
    assert.equal(text.includes(forbidden), false, `${file} references public-forbidden field ${forbidden}.`);
  }
  assert.doesNotMatch(text, /status\s*:/, `${file} must not send public status.`);
  assert.doesNotMatch(text, /priority\s*:/, `${file} must not send public priority.`);
}

const leadApi = await read("src/features/leads/services/leadApi.js");
assert.match(leadApi, /API_ENDPOINTS\.LEADS\.BASE/);
assert.match(leadApi, /API_ENDPOINTS\.LEADS\.FOLLOW_UPS/);
assert.match(leadApi, /API_ENDPOINTS\.LEADS\.SUMMARY/);
assert.doesNotMatch(leadApi, /LEAD_CREATED|ASSIGNED_MANAGER|ASSIGNED_EMPLOYEE|STATUS_CHANGED|FOLLOW_UP_SCHEDULED|FOLLOW_UP_COMPLETED/);

const manualActivityDialog = await read("src/features/lead-activities/forms/ManualActivityDialog.jsx");
assert.match(manualActivityDialog, /MANUAL_ACTIVITY_TYPES/);
assert.doesNotMatch(manualActivityDialog, /LEAD_CREATED|ASSIGNED_MANAGER|STATUS_CHANGED|CONVERTED/);

const leadActionsPanel = await read("src/features/leads/components/LeadActionsPanel.jsx");
assert.match(leadActionsPanel, /getLeadCapabilities/);
assert.doesNotMatch(leadActionsPanel, /PERMISSIONS|BACKEND_ROLES/);

const leadEditDialog = await read("src/features/leads/components/LeadCommandDialogs.jsx");
assert.match(leadEditDialog, /shouldRefetchAfterCrmError/);
assert.match(leadEditDialog, /role="alert"/);

const pipeline = await read("src/features/leads/components/LeadPipelineView.jsx");
assert.match(pipeline, /limit:\s*8/);
assert.match(pipeline, /status,/);
assert.doesNotMatch(pipeline, /drag|drop|draggable|onDrop/i);

const routes = [
  await read("src/routes/SuperAdminRoutes.jsx"),
  await read("src/routes/SalesManagerRoutes.jsx"),
  await read("src/routes/EmployeeRoutes.jsx"),
].join("\n");
for (const permission of [
  "LEADS_READ",
  "LEADS_CREATE",
]) {
  assert.match(routes, new RegExp(`PERMISSIONS\\.${permission}`), `Missing CRM route permission ${permission}.`);
}

for (const file of [
  "src/features/leads/components/LeadListView.jsx",
  "src/features/leads/components/LeadFollowUpsView.jsx",
]) {
  const text = await read(file);
  assert.match(text, /useDebouncedValue/, `${file} should debounce search.`);
  assert.match(text, /page:\s*1/, `${file} should reset pagination on filter changes.`);
}

const dateTime = await read("src/shared/utils/dateTime.js");
assert.match(dateTime, /env\.businessTimezone/);
assert.match(dateTime, /getFollowUpPresentationState/);

console.log("Phase 4 static audit passed.");
