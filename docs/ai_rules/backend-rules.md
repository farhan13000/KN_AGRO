# Backend Rules

These rules apply to the Node.js and Express backend for KN Agro.

## Backend Architecture

- Use feature-oriented modules under `backend/src/modules`.
- Keep the backend a modular monolith.
- Use Express routes, controllers, services, repositories, models, validators, mappers, constants, and policies.
- Keep business logic in services.
- Keep database access in repositories.
- Keep request parsing and response shaping in controllers.
- Keep access decisions in middleware and policies.

Recommended module shape:

```text
backend/src/modules/<feature>/
  <feature>.model.js
  <feature>.controller.js
  <feature>.service.js
  <feature>.repository.js
  <feature>.validation.js
  <feature>.routes.js
  <feature>.constants.js
  <feature>.mapper.js
  <feature>.policy.js
```

Use only the files needed for the feature, but keep names consistent.

## Request Flow

Use this flow:

```text
Request
  -> route
  -> authentication
  -> permission
  -> ownership/policy
  -> validation
  -> controller
  -> service
  -> repository
  -> model
  -> MongoDB
```

Do not put business logic in route files.
Do not put database queries in controllers except for trivial read-only health checks.
Do not let repositories make authorization decisions.

## API Versioning

Use `/api/v1` as the default API prefix.

Examples:

```text
/api/v1/auth/login
/api/v1/products
/api/v1/dsr/me/today
/api/v1/admin/dashboard
```

Keep public APIs clearly separated from protected APIs with routes and middleware.

## Standard API Response

Success:

```json
{
  "success": true,
  "message": "Products fetched successfully",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 75,
    "totalPages": 4
  }
}
```

Error:

```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": [],
  "requestId": "req_xxx"
}
```

Rules:

- Always return a predictable shape.
- Include pagination metadata for paginated endpoints.
- Include `requestId` in error responses.
- Do not leak stack traces in production responses.

## Controller Rules

Controllers should:

- Read validated request input.
- Read authenticated user context.
- Call one service method for the intended use case.
- Return standardized success responses.
- Pass errors to central error middleware.

Controllers should not:

- Build complex business rules.
- Query MongoDB directly for feature logic.
- Make cross-feature orchestration decisions when a service should own them.
- Trust client-provided role, permission, or ownership data.

## Service Rules

Services should:

- Own business rules and workflow transitions.
- Call repositories for persistence.
- Call other feature services for legitimate cross-feature workflows.
- Calculate totals for DSR, billing, purchase, payroll, and reports.
- Create audit events when important business state changes.
- Throw typed errors for validation, permission, not found, conflict, and business rule failures.

Services should not:

- Depend on Express `req` or `res`.
- Return raw Mongoose documents when a mapper or DTO is needed.
- Mutate unrelated modules directly through their models.

## Repository Rules

Repositories should:

- Encapsulate database queries.
- Use models for persistence.
- Support transactions/sessions for multi-write workflows.
- Keep query filters explicit.
- Return data to services without making policy decisions.

Repositories should not:

- Perform authorization checks.
- Send responses.
- Call controllers.
- Contain cross-feature business workflows.

## Validation Rules

- Validate all request bodies, params, query strings, and uploads.
- Validate IDs before querying MongoDB.
- Validate enums against constants.
- Validate numeric values for min/max and non-negative constraints.
- Validate dates and time zones for attendance, DSR, leave, payroll, purchases, and invoices.
- Validate arrays for length and item shape.
- Sanitize text fields that may be displayed later.

Frontend validation is never enough.

## Auth Module Rules

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

- Hash passwords with a strong password hashing library.
- Store refresh tokens safely.
- Rotate or invalidate refresh tokens on logout and password reset.
- Prevent inactive, disabled, resigned, terminated, or unauthorized users from logging in.
- Update `lastLogin` on successful login.

## Users, Roles, And Permissions Rules

- Use roles for broad access groups.
- Use permissions for granular business capabilities.
- Super Admin can manage admins, roles, permissions, global settings, and audit.
- Admin permissions must be assignable and revocable.
- Employees should have only personal workflow permissions by default.

Recommended permission names must follow dotted format:

```text
products.read
products.create
products.update
products.delete
attendance.manage
dsr.review
settings.manage
audit.read
```

Do not hard-code permission checks throughout the codebase when a shared middleware/helper can be used.

## Products And Categories Rules

Product management must support:

- Create, edit, delete or deactivate.
- Upload images.
- Assign category.
- Set unit, SKU, price, tax, minimum stock.
- Set featured.

Rules:

- Public product endpoints expose only active/published products.
- SKU should be unique where required by business rules.
- Product delete should be blocked or converted to deactivate when used by inventory, purchases, invoices, or DSR sales.

## Enquiry Rules

Public enquiry fields:

```text
name
phone
email
company
product
quantity
location
message
```

Rules:

- Public enquiry creation must be rate-limited.
- Validate contact fields.
- Do not require login for public enquiry.
- Admin enquiry management must support status tracking and follow-up notes when implemented.

## Customer And Supplier Rules

- Use generated codes where needed: `customerCode`, `supplierCode`.
- Validate GST number format when supplied.
- Track opening balance and status.
- Do not delete customers or suppliers with linked invoices, purchases, payments, or stock records unless explicitly supported by archival logic.

## Inventory Rules

Inventory must maintain:

- Current stock.
- Stock movement history.

Stock movement types:

```text
OPENING
PURCHASE
SALE
RETURN_IN
RETURN_OUT
ADJUSTMENT_IN
ADJUSTMENT_OUT
DAMAGE
CORRECTION
```

Rules:

- Every stock change requires a stock movement record.
- Stock movement records must include product, quantity, type, reference type, reference ID, previous stock, new stock, reason, and actor where applicable.
- Prevent negative stock unless settings explicitly allow it.
- Use transactions for workflows that update both business documents and inventory.

## Purchase Rules

Purchase flow:

```text
Purchase
  -> receive stock
  -> inventory increase
  -> PURCHASE stock movement
```

Rules:

- Validate supplier, products, quantities, rates, tax, discount, and payment status.
- Do not increase stock until the purchase is received/confirmed according to the implemented workflow.
- Use inventory service for stock changes.
- Keep purchase totals calculated server-side.

## Billing Rules

Invoice flow:

```text
Invoice confirmed
  -> billing service
  -> inventory service
  -> decrease stock
  -> SALE stock movement
```

Rules:

- Validate customer, products, quantities, rates, discount, tax, and payment details.
- Keep invoice totals calculated server-side.
- Do not trust totals supplied by the frontend.
- Do not decrease stock for draft invoices.
- Do not allow cancelled invoices to be edited as normal invoices.
- Record payments separately from invoice status where applicable.
- Generate printable/PDF invoices from server-approved invoice data.

## Employee Rules

Employee records include:

```text
employeeCode
name
phone
email
dateOfBirth
address
city
state
pincode
designation
department
joiningDate
reportingManager
salaryReference
documents
userAccount
requiresDsr
employmentStatus
```

Rules:

- Link employee records to user accounts when portal login is needed.
- Employee status must affect access to employee portal features.
- Employee code should be unique.
- Employee documents must use secure upload rules.

## Attendance Rules

Attendance model should include:

```text
employee
date
checkIn
checkOut
workingHours
status
source
remarks
editedBy
createdAt
updatedAt
```

Rules:

- Enforce one attendance record per employee per date.
- Employees can check in and check out for themselves only.
- Admin corrections require remarks and `editedBy`.
- Calculate working hours server-side.
- Attendance status affects DSR requirement logic.

## DSR Rules

Employee endpoints:

```text
GET    /api/v1/dsr/me
GET    /api/v1/dsr/me/today
GET    /api/v1/dsr/me/:id
POST   /api/v1/dsr
PATCH  /api/v1/dsr/:id
POST   /api/v1/dsr/:id/submit
POST   /api/v1/dsr/:id/resubmit
POST   /api/v1/dsr/:id/attachments
DELETE /api/v1/dsr/:id/attachments/:attachmentId
```

Admin endpoints:

```text
GET  /api/v1/dsr
GET  /api/v1/dsr/:id
GET  /api/v1/dsr/pending
GET  /api/v1/dsr/missed
GET  /api/v1/dsr/compliance
POST /api/v1/dsr/:id/approve
POST /api/v1/dsr/:id/request-correction
POST /api/v1/dsr/reminders
POST /api/v1/dsr/reminders/bulk
```

Rules:

- Employees can access only their own DSR.
- Derive employee ID from `req.user.employeeId`.
- Enforce unique employee plus report date.
- Allow draft, submit, correction, resubmit, approve, and missed workflows.
- Calculate total sales, collections, and expenses server-side.
- DSR requirement depends on `requiresDsr` and attendance status.
- Employees on leave do not require DSR unless settings explicitly override it.
- Reminder sends must create reminder records and notifications.

## Leave Rules

Employee:

- Apply leave.
- View balance.
- View history.
- Cancel pending request.

Admin:

- View.
- Approve.
- Reject.
- Add remark.

Rules:

- Validate date ranges.
- Prevent conflicting approved leave where required.
- Require remarks for rejection.
- Keep status transitions explicit.
- Approved leave affects attendance, DSR, and payroll workflows.

## Payroll Rules

Payroll supports:

- Salary structure.
- Attendance adjustment.
- Allowances.
- Deductions.
- Monthly payroll.
- Payslip.
- Payment status.

Rules:

- Generate payroll from salary structure, attendance, approved leave, allowances, and deductions.
- Keep payroll calculations server-side.
- Do not expose one employee's payroll to another employee.
- Keep payroll records traceable and auditable.

## Notifications Rules

Notification types:

```text
GENERAL
ATTENDANCE
DSR_REMINDER
DSR_CORRECTION
DSR_APPROVED
LEAVE
PAYROLL
INVOICE
SYSTEM
```

Rules:

- Create in-app notifications for DSR reminders in the initial implementation.
- Notification records should reference the source entity when possible.
- Users can mark their own notifications as read.
- Admin/system notifications require appropriate permissions.

## Reports Rules

Reports may include:

- Sales.
- Invoice.
- Outstanding payment.
- Inventory.
- Low stock.
- Purchase.
- Customer.
- Supplier.
- Employee.
- Attendance.
- DSR.
- DSR compliance.
- Leave.
- Payroll.

Rules:

- Reports should use server-side filters.
- Respect permissions for every report.
- Avoid exposing private employee/payroll data to unauthorized roles.
- Use consistent date range filtering.

## Settings Rules

Settings may include:

- Business profile.
- GST/tax.
- Invoice prefix and numbering.
- Financial year.
- Payroll settings.
- Attendance settings.
- DSR settings.
- Notification settings.
- File upload settings.

Rules:

- Only Super Admin or explicitly permitted users can manage settings.
- Settings changes must be audited.
- Validate setting values strictly because they affect business workflows.

## Backend Naming Rules

Files:

```text
product.model.js
product.controller.js
product.service.js
product.repository.js
product.validation.js
product.routes.js
product.mapper.js
product.policy.js
```

Code:

- Functions: `camelCase`.
- Classes: `PascalCase`.
- Constants: `UPPER_SNAKE_CASE`.
- Collections: lowercase plural.

## Backend Review Checklist

Before finishing backend work, verify:

- Routes are protected correctly.
- Validation covers body, params, query, and files.
- Business logic lives in services.
- Database access lives in repositories.
- Cross-feature calls happen service-to-service.
- Audit events are created for important state changes.
- API responses use the standard shape.
- Sensitive fields are omitted from responses.
- Multi-write workflows are transaction-safe where needed.
