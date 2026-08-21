# Security Rules

These rules apply to authentication, authorization, uploads, privacy, audit logging, and all security-sensitive features.

## Security Model

Every protected request must use layered security:

```text
Authentication
  -> Role
  -> Permission
  -> Ownership
  -> Policy
```

The frontend may hide routes and buttons, but the backend must enforce every security decision.

## Authentication Rules

Authentication must support:

- Login.
- Logout.
- Access token.
- Refresh token.
- Forgot password.
- Reset password.
- Current user.
- Account status.
- Last login.
- Role validation.
- Permission validation.

Rules:

- Hash passwords using a strong password hashing algorithm.
- Never store plaintext passwords.
- Never return password hashes in API responses.
- Keep access token expiry short.
- Protect refresh tokens and invalidate them on logout/password reset.
- Block disabled, inactive, resigned, terminated, or unauthorized accounts.
- Rate-limit login, forgot password, reset password, public enquiry, and upload endpoints.

## Authorization Rules

Roles:

- `SUPER_ADMIN`: full system control.
- `ADMIN`: operational management.
- `EMPLOYEE`: personal employee portal.
- `PUBLIC`: unauthenticated public site.

Rules:

- Use role checks for broad section access.
- Use permissions for business actions.
- Use ownership checks for personal records.
- Use policies for state-sensitive actions.
- Do not rely on client-submitted role or permission values.
- Derive the current user from the verified token.

## Permission Rules

Permission names should use dotted format:

```text
dashboard.read
products.read
products.create
products.update
products.delete
categories.manage
enquiries.manage
customers.create
suppliers.update
inventory.adjust
purchases.create
billing.cancel
employees.update
attendance.manage
dsr.create
dsr.review
dsr.remind
leave.approve
payroll.manage
reports.read
notifications.manage
content.manage
users.manage
roles.manage
settings.manage
audit.read
```

Rules:

- Check permissions on every protected business action.
- Keep permission constants centralized.
- Do not scatter string literals through controllers.
- Super Admin can bypass ordinary permission checks only through an explicit, documented rule.

## Ownership Rules

Employees must access only their own:

- Profile.
- Attendance.
- DSR.
- Leave.
- Payroll.
- Payslips.
- Notifications.

Rules:

- Resolve employee ownership from `req.user.employeeId`.
- Do not trust `employeeId` from employee-facing request bodies.
- For employee endpoints, prefer `/me` patterns.
- Admin endpoints may accept employee filters only with proper permissions.

Example:

```js
const employeeId = req.user.employeeId;
```

## Policy Rules

Use policies for actions that depend on record state.

Examples:

- Draft DSR can be edited by owner.
- Submitted DSR cannot be edited until correction is requested.
- DSR can be approved only by an authorized admin.
- Draft invoice can be edited.
- Confirmed invoice affects inventory.
- Cancelled invoice cannot be edited normally.
- Pending leave can be cancelled by employee.
- Approved/rejected leave needs admin permission to change.

Do not put these state transitions only in frontend UI logic.

## Upload Security Rules

Validate every upload:

- Extension.
- MIME type.
- File size.
- File count.
- Ownership.
- Related entity state.
- Storage path.

Allowed DSR upload types:

```text
.pdf
.xlsx
.xls
.csv
.jpg
.jpeg
.png
```

Recommended initial DSR file size:

```text
5-10 MB
```

Rules:

- Keep upload limits configurable in settings.
- Store files outside public source directories.
- Store metadata in MongoDB, not large file blobs.
- Sanitize original filenames.
- Generate safe storage names.
- Do not allow path traversal.
- Do not serve private files without authorization.

DSR storage pattern:

```text
storage/uploads/dsr/<employeeId>/<year>/<month>/<reportDate>/
```

## Public API Rules

Public routes may support:

- Public website content.
- Active products and categories.
- Contact form.
- Enquiry submission.

Public routes must not expose:

- Employee data.
- Payroll data.
- Customer private data.
- Supplier private data.
- Internal stock movement history.
- Settings secrets.
- Audit logs.
- Admin-only product fields.

Apply rate limiting and input validation to public forms.

## DSR Security Rules

- Employees can access only their own DSR.
- Employees create DSR for themselves only.
- Employees can submit, edit drafts, upload files, and resubmit only when policy allows.
- Admins with permission can review, approve, request correction, send reminders, and export.
- Reminder messages must be logged.
- Reminder channels must respect configured availability.
- Initial implementation must support `IN_APP` reminders.

DSR pending logic must be server-side:

```text
requiresDsr = true
attendance = PRESENT or HALF_DAY
DSR not submitted
```

Employees on leave do not require DSR unless explicitly configured otherwise.

## Attendance Security Rules

- Employees can check in and check out only for themselves.
- Admin correction requires `attendance.manage`.
- Admin correction must record `editedBy` and `remarks`.
- Attendance history must be protected by ownership or admin permission.
- Attendance changes that affect payroll or DSR must be audited.

## Billing And Inventory Security Rules

- Creating invoices requires billing permission.
- Confirming invoices requires inventory effect permission through backend workflow.
- Cancelling invoices requires explicit permission.
- Stock adjustments require `inventory.adjust`.
- Stock adjustments require remarks.
- Financial totals must be calculated server-side.
- Payment actions must be audited.

## Payroll Security Rules

- Employees can view only their own payroll/payslips.
- Payroll management requires `payroll.manage`.
- Payroll reports require explicit report/payroll permission.
- Payroll generation and payment status updates must be audited.
- Do not expose salary details in unrelated employee list endpoints unless authorized.

## Audit Logging Rules

Audit important events:

```text
LOGIN
ADMIN_CREATE
ADMIN_DISABLE
ROLE_UPDATE
PERMISSION_UPDATE
PRODUCT_CREATE
PRODUCT_UPDATE
PRODUCT_DELETE
STOCK_ADJUST
PURCHASE_CREATE
INVOICE_CREATE
INVOICE_CANCEL
PAYMENT_ADD
EMPLOYEE_CREATE
EMPLOYEE_UPDATE
ATTENDANCE_UPDATE
DSR_SUBMIT
DSR_APPROVE
DSR_CORRECTION_REQUEST
DSR_REMINDER_SENT
LEAVE_APPROVE
LEAVE_REJECT
PAYROLL_GENERATE
SETTINGS_UPDATE
```

Audit records should include:

```text
user
role
action
module
entityType
entityId
oldValue
newValue
ipAddress
userAgent
requestId
createdAt
```

Rules:

- Do not allow normal users to edit audit logs.
- Audit log reads require `audit.read`.
- Never store passwords, tokens, or secret values in audit records.
- Mask sensitive values in old/new snapshots.

## Environment And Secrets Rules

- Never commit `.env`.
- Keep `.env.example` with names only, not real secrets.
- Required backend env examples:

```text
NODE_ENV
PORT
MONGODB_URI
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
JWT_ACCESS_EXPIRES_IN
JWT_REFRESH_EXPIRES_IN
FRONTEND_URL
EMAIL_HOST
EMAIL_PORT
EMAIL_USER
EMAIL_PASSWORD
FILE_STORAGE_PROVIDER
```

- Required frontend env examples:

```text
VITE_APP_NAME
VITE_API_BASE_URL
VITE_PUBLIC_SITE_URL
```

## Response Privacy Rules

Never return:

- Password hashes.
- Refresh tokens.
- Reset tokens.
- Internal auth secrets.
- Private upload paths where a signed or authorized download endpoint should be used.
- Payroll data to unauthorized users.
- Audit details to unauthorized users.
- Supplier/private pricing data on public endpoints.

Use mappers/serializers to shape responses safely.

## HTTP Security Rules

Use:

- Helmet.
- CORS configuration.
- Rate limiting.
- MongoDB sanitization.
- Request IDs.
- Request logging.
- Central error handler.
- Not-found handler.

CORS must use configured origins. Do not use open wildcard CORS for credentialed protected APIs.

## Error Handling Rules

- Do not leak stack traces in production.
- Use typed errors for validation, auth, permission, not found, conflict, and business rule failures.
- Include `requestId` in error responses.
- Log server errors with enough context for debugging.
- Avoid logging secrets, tokens, passwords, or full private documents.

## Security Review Checklist

Before finishing security-sensitive work, verify:

- Backend enforces auth, role, permission, ownership, and policy.
- Employee endpoints derive ownership from authenticated context.
- Public routes expose only public data.
- Uploads validate type, size, count, and ownership.
- Important state changes create audit logs.
- Secrets and sensitive fields do not appear in responses or logs.
- Rate limiting covers auth and public submission endpoints.
