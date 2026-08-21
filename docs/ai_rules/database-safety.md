# Database Safety Rules

These rules apply to MongoDB, Mongoose models, indexes, migrations/seeds, and any code that reads or writes persistent data.

## Source Of Truth

Each business entity must have one source of truth.

Recommended collections:

```text
users
roles
products
categories
enquiries
customers
suppliers
inventories
stockmovements
purchases
invoices
payments
employees
attendances
dsrs
dsrreminders
leaves
salarystructures
payrolls
notifications
auditlogs
websitecontents
banners
testimonials
settings
```

Do not create duplicate collections for role-specific views.

## Collection Ownership

- `products` owns product master data.
- `categories` owns category master data.
- `inventories` owns current stock.
- `stockmovements` owns stock history.
- `purchases` owns purchase documents.
- `invoices` owns invoice documents.
- `payments` owns payment records.
- `employees` owns employee master records.
- `attendances` owns attendance records.
- `dsrs` owns daily sales reports.
- `dsrreminders` owns DSR reminder logs.
- `payrolls` owns generated payroll records.
- `auditlogs` owns audit history.

Use references between collections instead of copying full records unless a historical snapshot is needed.

## Schema Rules

Every important schema should include:

- Required fields where business rules demand them.
- Enum validation for statuses and types.
- Timestamps.
- References with clear `ref` names.
- Soft-delete or status fields where deletion would break history.
- Indexes for common query patterns.

Avoid schemaless free-form objects for core business entities.

## ID And Reference Rules

- Validate ObjectIds before querying.
- Do not accept ownership IDs from the client when they can be derived from auth context.
- Keep references consistent with entity ownership.
- Use immutable references for historical documents when required.
- Do not store frontend route IDs as trusted identity.

## Unique Index Rules

Use unique indexes for business uniqueness:

- `employeeCode`.
- `customerCode`.
- `supplierCode`.
- Product `sku` when SKU is required.
- Attendance: employee plus date.
- DSR: employee plus report date.
- Invoice number.
- Role name where role names must be unique.

Recommended indexes:

```text
attendances: employee + date UNIQUE
attendances: date + status
attendances: employee + date

dsrs: employee + reportDate UNIQUE
dsrs: reportDate + status
dsrs: employee + status
dsrs: reportDate + submittedAt

stockmovements: product + createdAt
stockmovements: referenceType + referenceId

invoices: customer + createdAt
invoices: status + paymentStatus

purchases: supplier + createdAt

auditlogs: user + createdAt
auditlogs: module + action + createdAt
```

## Transaction Rules

Use MongoDB transactions for workflows that must succeed or fail together.

Transaction-required examples:

- Confirm invoice plus decrease inventory plus create stock movement.
- Cancel/reverse invoice plus inventory correction when implemented.
- Receive purchase plus increase inventory plus create stock movement.
- Payroll generation plus payroll item records.
- DSR reminder send plus reminder log plus notification record.
- Settings change plus audit log where consistency is required.

If the deployment does not support transactions, implement explicit compensation logic and document the limitation.

## Inventory Data Safety

Every stock change must create a stock movement.

Stock movement should capture:

```text
product
type
quantity
previousStock
newStock
referenceType
referenceId
reason
createdBy
createdAt
```

Rules:

- Never update current stock without a stock movement.
- Do not calculate current stock only from frontend state.
- Prevent negative stock unless settings explicitly allow it.
- Use server-side quantity and total calculations.
- Stock corrections must require reason/remarks.

## Billing Data Safety

- Draft invoices must not reduce stock.
- Confirmed invoices reduce stock through inventory service.
- Cancelled invoices must not be edited as active invoices.
- Payment records must remain traceable.
- Invoice totals must be calculated server-side.
- Invoice numbers must not collide.
- Store enough customer/product snapshot data on invoices for historical accuracy where needed.

## Purchase Data Safety

- Purchase totals must be calculated server-side.
- Receiving stock must go through inventory service.
- Purchase status must control whether stock is increased.
- Supplier references must be valid.
- Store product snapshot data when historical purchase accuracy requires it.

## Attendance Data Safety

Attendance must enforce:

```text
employee + date UNIQUE
```

Rules:

- Store one attendance record per employee per date.
- Admin edits must track `editedBy` and `remarks`.
- Calculate working hours server-side.
- Preserve enough history for payroll and DSR compliance.
- Do not delete attendance used by payroll or DSR compliance; correct it with audit instead.

## DSR Data Safety

DSR must enforce:

```text
employee + reportDate UNIQUE
```

Rules:

- Employee ownership comes from authenticated user context.
- Do not trust client-provided employee ownership.
- Store DSR status using constants.
- Calculate totals server-side.
- Keep attachments as metadata records, not raw file blobs in MongoDB.
- Review actions must store reviewer, reviewed time, and admin remarks when applicable.
- Reminder count and last reminder time must be updated consistently with reminder records.

## DSR Requirement Rule

An employee has pending DSR when:

```text
employee.requiresDsr = true
attendance.status in PRESENT or HALF_DAY
DSR not submitted for the report date
```

Exception:

```text
attendance.status = LEAVE
```

In that case, DSR is not required unless settings explicitly override the rule.

## Employee Data Safety

- Employee code must be unique.
- Employment status controls access.
- Employee documents must be stored through secure file handling.
- User account references must not be duplicated across multiple active employees.
- Resigned or terminated employees must not keep active portal access unless explicitly allowed.

## Payroll Data Safety

- Payroll depends on salary structure, attendance, approved leave, allowances, and deductions.
- Payroll calculations must be server-side.
- Generated payroll records should be immutable after finalization, except through correction flows.
- Payslip access must be ownership-protected.
- Payroll generation and payment actions must be audited.

## Soft Delete Rules

Prefer status changes or soft delete for:

- Products used in invoices, purchases, inventory, or DSR.
- Customers with invoices or payments.
- Suppliers with purchases.
- Employees with attendance, DSR, leave, or payroll.
- Roles assigned to users.

Hard delete is acceptable only for safe draft/test data or when explicitly required and protected by checks.

## Seed Data Rules

- Never seed real secrets.
- Use fake or placeholder passwords and force reset where needed.
- Seed default roles and permissions idempotently.
- Seed settings idempotently.
- Do not overwrite production data from seeds.

## Migration Rules

- Make migrations repeatable or clearly one-time.
- Back up before destructive schema/data changes.
- Avoid dropping fields without a migration path.
- Preserve audit, payroll, invoice, payment, stock movement, attendance, and DSR history.
- Test migrations on non-production data first.

## Query Safety Rules

- Paginate list endpoints.
- Add filters for date-heavy collections.
- Do not return unbounded audit, notification, DSR, invoice, or stock movement lists.
- Use indexes for common reports.
- Avoid broad regex queries on large collections unless indexed or limited.

## Sensitive Field Rules

Never return these fields unless explicitly required and authorized:

- Password hashes.
- Refresh tokens.
- Reset tokens.
- Internal auth metadata.
- Payroll details outside owner/admin permissions.
- Private employee documents.
- Supplier/internal pricing fields on public APIs.
- Audit internals on non-audit endpoints.

## Database Review Checklist

Before finishing database work, verify:

- The entity has one source of truth.
- Required indexes exist.
- Unique business rules are enforced at the database level where possible.
- Multi-write workflows are transaction-safe.
- No sensitive fields leak in query responses.
- Soft-delete/status behavior protects business history.
- Audit-critical records are preserved.
