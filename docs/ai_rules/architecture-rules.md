# Architecture Rules

These rules define the shape of the KN Agro platform. Follow them before creating files, modules, routes, database models, or shared helpers.

## Project Shape

- Build a MERN hybrid modular monolith.
- Frontend uses role-based folders because each role has a different user experience.
- Backend uses feature-oriented folders because business rules must stay centralized.
- MongoDB collections represent one source of truth per entity.
- Authorization always combines authentication, role, permission, ownership, and policy checks.

## Frontend Boundary

The frontend is organized by the user role:

```text
frontend/src/modules/
  super-admin/
  admin/
  employee/
  public/
  auth/
```

Use this when building screens, pages, role dashboards, and role-specific workflows.

Examples:

- Admin product management belongs in `frontend/src/modules/admin/products`.
- Public product browsing belongs in `frontend/src/modules/public/products`.
- Employee DSR creation belongs in `frontend/src/modules/employee/dsr`.
- Super Admin audit review belongs in `frontend/src/modules/super-admin/audit-logs`.

Do not place role-specific UI inside backend-style feature folders.

## Backend Boundary

The backend is organized by business feature:

```text
backend/src/modules/
  auth/
  users/
  roles/
  products/
  categories/
  enquiries/
  customers/
  suppliers/
  inventory/
  purchases/
  billing/
  employees/
  attendance/
  dsr/
  leave/
  payroll/
  dashboard/
  reports/
  notifications/
  content/
  settings/
  audit/
```

Use this when building routes, controllers, services, repositories, models, validation, mappers, constants, and policies.

Do not create backend folders like:

```text
backend/src/modules/admin/products
backend/src/modules/employee/attendance
backend/src/modules/public/products
```

Different roles may use the same backend feature module through different permissions and policies.

## Dependency Direction

Backend request flow must follow this direction:

```text
route
  -> middleware
  -> controller
  -> service
  -> repository
  -> model
  -> MongoDB
```

Allowed dependencies:

- Routes call controllers.
- Controllers call services.
- Services call repositories and other services when business workflows require it.
- Repositories call models.
- Policies may be used by controllers or services to enforce business access rules.
- Validators may be used at route or controller boundaries.

Forbidden dependencies:

- Service to controller.
- Repository to controller.
- Model to controller.
- Route directly to model for business writes.
- Frontend directly deciding backend authorization outcomes.

## Cross-Feature Calls

Cross-feature service calls are allowed only when they represent a real business workflow.

Allowed examples:

```text
billing.service -> inventory.service
purchase.service -> inventory.service
payroll.service -> attendance.service
dsr.service -> attendance.service
dsrReminder.service -> notification.service
```

Rules:

- Keep the owner feature responsible for its entity.
- Keep cross-feature calls in services, not controllers or repositories.
- Do not duplicate logic to avoid a service call.
- If two modules need the same generic technical helper, put it in `shared`, `utils`, or `services`.

## Source Of Truth Rules

- Product data belongs to products.
- Category data belongs to categories.
- Customer data belongs to customers.
- Supplier data belongs to suppliers.
- Current stock belongs to inventory.
- Stock history belongs to stock movements.
- Purchase documents belong to purchases.
- Invoices and payments belong to billing.
- Employee master records belong to employees.
- Attendance records belong to attendance.
- DSR records and DSR reminders belong to dsr.
- Leave requests belong to leave.
- Salary structures, payroll runs, and payslips belong to payroll.
- Notifications belong to notifications.
- Business settings belong to settings.
- Audit events belong to audit.

Do not copy full business entities into other modules. Store references and snapshots only when the business requires historical accuracy.

## Shared Code Rules

Use shared frontend code for reusable UI and behavior:

```text
frontend/src/shared/
frontend/src/hooks/
frontend/src/context/
frontend/src/store/
frontend/src/constants/
frontend/src/config/
frontend/src/utils/
```

Use shared backend code for generic infrastructure:

```text
backend/src/middlewares/
backend/src/shared/
backend/src/services/
backend/src/utils/
backend/src/config/
backend/src/database/
```

Shared code must not become a dumping ground for feature business logic.

## Module Completion Rule

When implementing a feature module, prefer a complete vertical slice:

- Model or schema if the feature persists data.
- Validation for inbound data.
- Repository for database access.
- Service for business rules.
- Policy if access depends on ownership or state.
- Controller for request handling.
- Routes for API exposure.
- Constants for statuses and event names.
- Audit logging for important state changes.
- Tests or verification where the project supports them.

Avoid empty placeholder modules unless the user explicitly asks for scaffolding only.

## Status And Workflow Rules

Use explicit status enums for business workflows.

Required examples:

- Attendance: `PRESENT`, `ABSENT`, `HALF_DAY`, `LEAVE`, `HOLIDAY`, `WEEK_OFF`.
- DSR: `DRAFT`, `SUBMITTED`, `UNDER_REVIEW`, `APPROVED`, `NEEDS_CORRECTION`, `RESUBMITTED`, `MISSED`.
- Invoice: `DRAFT`, `CONFIRMED`, `CANCELLED`.
- Payment: `UNPAID`, `PARTIALLY_PAID`, `PAID`.
- Leave: `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`.
- Employment: `ACTIVE`, `INACTIVE`, `ON_LEAVE`, `RESIGNED`, `TERMINATED`.

Do not use loose strings scattered through the codebase. Centralize statuses in constants.

## DSR Architecture Rules

DSR is a first-class employee operations feature.

Backend files should be organized around:

```text
backend/src/modules/dsr/
  dsr.model.js
  dsrReminder.model.js
  dsr.controller.js
  dsr.service.js
  dsr.repository.js
  dsrReminder.repository.js
  dsr.validation.js
  dsr.routes.js
  dsr.constants.js
  dsr.mapper.js
  dsr.policy.js
  dsrReminder.service.js
  dsrCompliance.service.js
  dsrFile.service.js
```

Responsibilities:

- `dsr.service.js`: draft, create, submit, resubmit, approve, correction, totals.
- `dsrReminder.service.js`: generate, send, bulk reminders, log reminders.
- `dsrCompliance.service.js`: pending, missed, compliance percentage, attendance-vs-DSR.
- `dsrFile.service.js`: secure DSR attachments.

## Public Website Boundary

Public pages may read published products, categories, content, testimonials, banners, and enquiry forms.

Public APIs must not expose admin-only fields such as:

- Cost price.
- Internal notes.
- Supplier details.
- Stock adjustment history.
- Audit records.
- Employee data.
- Payroll data.
- Private customer data.

## Admin And Super Admin Boundary

- Super Admin owns system-wide control: admins, roles, permissions, settings, global reports, audit, system monitoring.
- Admin owns operational management: products, enquiries, customers, suppliers, inventory, purchases, billing, employees, attendance, DSR review, leave, payroll, reports, content, notifications.
- Keep Super Admin screens separate from Admin screens even when they call the same backend module.

## Employee Boundary

Employee-facing features are personal and ownership-constrained:

- Profile.
- Attendance.
- DSR.
- Leave.
- Payroll and payslips.
- Notifications.

Employees must access only their own private records unless a future role explicitly grants management permission.

## Review Checklist

Before finishing architecture work, verify:

- The frontend folder answers "who uses this?"
- The backend folder answers "what feature is this?"
- No backend business logic is duplicated for roles.
- Authorization is backend-enforced.
- Entity ownership is clear.
- Cross-module calls happen at service level.
- Audit-sensitive actions are captured.
