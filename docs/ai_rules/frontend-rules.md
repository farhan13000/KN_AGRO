# Frontend Rules

These rules apply to the React frontend for KN Agro.

## Frontend Architecture

- Use React.js with JavaScript.
- Organize user-facing work by role under `frontend/src/modules`.
- Keep application bootstrap, routing, providers, and query client under `frontend/src/app`.
- Keep API client setup under `frontend/src/api`.
- Keep route guards under `frontend/src/routes`.
- Keep layouts under `frontend/src/layouts`.
- Keep reusable UI under `frontend/src/shared`.

Recommended root:

```text
frontend/src/
  app/
  api/
  routes/
  layouts/
  modules/
  shared/
  hooks/
  context/
  store/
  constants/
  config/
  utils/
  assets/
```

## Role Modules

Use these role folders:

```text
frontend/src/modules/super-admin/
frontend/src/modules/admin/
frontend/src/modules/employee/
frontend/src/modules/public/
frontend/src/modules/auth/
```

Rules:

- Put pages in `pages`.
- Put local components in `components`.
- Put module API wrappers in `api`.
- Put role-specific helpers close to the module.
- Move a component to `shared` only when it is truly reusable across modules.

Example:

```text
frontend/src/modules/admin/dsr/
  api/dsr.api.js
  components/DsrTable.jsx
  components/DsrReminderModal.jsx
  pages/DsrDashboardPage.jsx
```

## Routing Rules

Required routes:

- Public: `/`, `/about`, `/products`, `/products/:slug`, `/categories`, `/contact`, `/enquiry`.
- Super Admin: `/super-admin/dashboard`, `/super-admin/admins`, `/super-admin/roles`, `/super-admin/permissions`, `/super-admin/reports`, `/super-admin/settings`, `/super-admin/audit-logs`, `/super-admin/system`.
- Admin: `/admin/dashboard`, `/admin/products`, `/admin/categories`, `/admin/enquiries`, `/admin/customers`, `/admin/suppliers`, `/admin/inventory`, `/admin/purchases`, `/admin/invoices`, `/admin/employees`, `/admin/attendance`, `/admin/dsr`, `/admin/dsr/pending`, `/admin/dsr/missed`, `/admin/dsr/:id`, `/admin/dsr/reports`, `/admin/leave`, `/admin/payroll`, `/admin/reports`, `/admin/content`.
- Employee: `/employee/dashboard`, `/employee/profile`, `/employee/attendance`, `/employee/dsr`, `/employee/dsr/today`, `/employee/dsr/create`, `/employee/dsr/:id`, `/employee/dsr/:id/edit`, `/employee/dsr/history`, `/employee/leave`, `/employee/payroll`, `/employee/notifications`.

Use route guards:

- `ProtectedRoute` for authenticated users.
- `SuperAdminRoute` for Super Admin sections.
- `AdminRoute` for Admin sections.
- `EmployeeRoute` for Employee sections.
- `PermissionRoute` for granular checks.

Frontend route guards improve UX but do not replace backend authorization.

## Authentication UX

After login, redirect by role:

```text
SUPER_ADMIN -> /super-admin/dashboard
ADMIN       -> /admin/dashboard
EMPLOYEE    -> /employee/dashboard
```

Rules:

- Do not store secrets in local frontend code.
- Do not decode a token and treat it as final authorization.
- Keep auth state centralized.
- Handle expired access tokens through the API client and refresh flow.
- Clear user state on logout or refresh failure.

## API Client Rules

- Use one shared API client, such as `axiosClient.js`.
- Define endpoint constants in `apiEndpoints.js`.
- Keep request and response interceptors centralized.
- Include access tokens through the request interceptor.
- Handle refresh/token-expiry behavior in one place.
- Normalize API errors before showing UI messages.

Feature API files should call the shared client:

```text
products.api.js
billing.api.js
attendance.api.js
employeeDsr.api.js
```

Do not call `fetch` or `axios` ad hoc across components.

## Component Rules

- Use `PascalCase.jsx` for components.
- Keep pages as route-level containers.
- Keep forms, tables, cards, filters, modals, and badges as components.
- Use controlled form state where validation or dynamic behavior is needed.
- Keep business calculations out of display-only components.
- Avoid duplicating a shared component across role folders.

Common shared components:

```text
Button
Input
Select
DatePicker
Modal
Table
Pagination
Loader
SearchBox
FileUploader
StatusBadge
ConfirmDialog
```

## Form Rules

- Validate required fields on the frontend for user experience.
- Always rely on backend validation as the real enforcement layer.
- Show field-level errors when the API returns validation details.
- Preserve user input after validation failures.
- Confirm destructive actions such as cancel invoice, disable user, delete product, and stock adjustment.

Business forms must match project fields from `about_the_project.md`.

## Public Website Rules

The public website must include:

- Home.
- About.
- Products.
- Categories.
- Product details.
- Contact.
- Enquiry.
- Legal pages.

Rules:

- Public content must only use published/active data.
- Product enquiry must collect name, phone, email, company, product, quantity, location, and message.
- Do not expose internal stock movement, supplier, customer, employee, payroll, audit, or settings data.
- Use accessible forms and clear validation states.
- Keep WhatsApp contact as a visible conversion path when configured.

## Admin UI Rules

Admin screens must support operational work:

- Product/category management.
- Enquiry management.
- Customers and suppliers.
- Inventory and stock movements.
- Purchases.
- Billing and invoices.
- Employees.
- Attendance.
- DSR review and reminders.
- Leave.
- Payroll.
- Reports.
- Content.
- Notifications.

Admin UIs should be efficient, dense enough for repeated use, and clear for filtering, sorting, search, exports, and status review.

## Super Admin UI Rules

Super Admin screens must support:

- Admin account management.
- Roles and permissions.
- Business settings.
- Global reports.
- Audit logs.
- System monitoring.

Do not mix Super Admin-only settings into regular Admin pages.

## Employee UI Rules

Employee dashboard should show:

- Today's attendance.
- Check in and check out.
- Today's DSR status.
- Upload or create DSR.
- Pending DSR reminders.
- Leave balance.
- Latest payslip.
- Notifications.

Employee pages must never provide UI for selecting another employee's private records unless a future management permission is explicitly added.

## DSR Frontend Rules

Employee DSR module should include:

```text
TodayDsrCard.jsx
DsrForm.jsx
CustomerVisitsForm.jsx
SalesItemsForm.jsx
CollectionsForm.jsx
LeadsForm.jsx
ExpensesForm.jsx
DsrFileUploader.jsx
DsrStatusBadge.jsx
DsrHistoryTable.jsx
DsrReminderBanner.jsx
```

Admin DSR module should include:

```text
DsrSummaryCards.jsx
DsrTable.jsx
DsrFilters.jsx
DsrDetails.jsx
DsrReviewForm.jsx
DsrStatusBadge.jsx
DsrAttachmentList.jsx
DsrReminderModal.jsx
DsrReminderMessage.jsx
BulkDsrReminderModal.jsx
DsrComplianceChart.jsx
```

Rules:

- Employee DSR creation must support draft, submit, edit draft, resubmit, upload file, and history.
- Admin DSR must support pending, missed, review, approve, correction, reminders, bulk reminders, export, and compliance reports.
- Show admin remarks clearly for correction requests.
- Show reminder notifications without hiding the submit action.
- Do not let employee pages choose `employeeId` for DSR ownership. The backend resolves it from the authenticated user.

## Attendance Frontend Rules

Employee attendance must support:

- Check in.
- Check out.
- Today's status.
- History.
- Monthly calendar.
- Working hours.
- Late, absent, leave, holiday, and week-off states.

Admin attendance must support:

- View all attendance.
- Filter by employee, date, and department.
- Add or correct attendance.
- Mark present, absent, leave, holiday, and week off.
- Edit check-in and check-out.
- Export attendance.

All admin corrections must send remarks to the backend for audit.

## Billing And Inventory UI Rules

- Confirm invoice before decreasing stock.
- Show invoice status and payment status separately.
- Make cancel invoice a confirmed action.
- Show low stock warnings in product, billing, and inventory contexts.
- For stock adjustment, require reason/remarks.
- Do not hide failed inventory updates behind a successful invoice UI.

## Naming Rules

Components:

```text
ProductCard.jsx
InvoiceForm.jsx
EmployeeTable.jsx
```

Hooks:

```text
useAuth.js
usePermissions.js
usePagination.js
```

API files:

```text
products.api.js
billing.api.js
attendance.api.js
```

Utilities:

```text
formatCurrency.js
formatDate.js
calculateTotals.js
```

## UI State Rules

Every data screen should consider:

- Loading state.
- Empty state.
- Error state.
- Permission denied state.
- Success state.
- Pagination where lists can grow.
- Filters where business users need daily operations.

Do not leave tables without empty and error states.

## Accessibility Rules

- Use semantic headings and labels.
- Inputs must have accessible labels.
- Buttons must have meaningful text or accessible labels.
- Preserve keyboard access for menus, modals, and dialogs.
- Do not use color alone to represent status.
- Keep invoice, payroll, attendance, and DSR status readable in text.

## Frontend Review Checklist

Before finishing frontend work, verify:

- The module is under the correct role folder.
- Shared components are not duplicated.
- API calls go through the shared client.
- Routes are protected by role and permission guards.
- Backend remains the final security layer.
- Loading, empty, error, and success states exist.
- Sensitive fields are not exposed in public or employee views.
