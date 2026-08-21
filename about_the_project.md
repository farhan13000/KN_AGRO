# KN Agro — Complete MERN Project Specification

> **Project Type:** Business Website + Employee Management + Inventory + Billing + DSR Management  
> **Frontend:** Role-Based Architecture  
> **Backend:** Feature-Oriented Modular Architecture  
> **Stack:** React.js + JavaScript + Node.js + Express.js + MongoDB  
> **Primary Roles:** Super Admin, Admin, Employee, Public  
> **Architecture:** Scalable Hybrid Modular Monolith  
> **Version:** Complete Project Specification with Attendance + DSR

---

# 1. Project Overview

KN Agro requires one integrated platform containing:

```text
Public Business Website
        +
Product Catalogue
        +
Enquiry Management
        +
Admin Dashboard
        +
Employee Management
        +
Attendance
        +
Daily Sales Report (DSR)
        +
Inventory
        +
Purchase Management
        +
Billing / Invoices
        +
Customers
        +
Suppliers
        +
Payroll
        +
Reports
        +
Notifications
        +
Role & Permission Management
        +
Audit Logs
```

---

# 2. Architecture Strategy

```text
Frontend → Role-Based
Backend  → Feature-Oriented Modular
Database → Single Source of Truth per Entity
Security → Authentication + Role + Permission + Ownership + Policy
```

Frontend:

```text
super-admin/
admin/
public/
employee/
```

Backend:

```text
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

---

# 3. Roles and Responsibilities

## Super Admin

- Full system control
- Admin management
- Roles and permissions
- Global reports
- Business settings
- Audit logs
- System monitoring

## Admin

- Dashboard
- Products and categories
- Enquiries
- Customers and suppliers
- Inventory
- Purchases
- Billing
- Employees
- Attendance
- DSR review and reminders
- Leave
- Payroll
- Reports
- Website content
- Notifications

## Employee

- Personal dashboard
- Profile
- Attendance
- Daily Sales Report
- Leave
- Payroll / payslips
- Notifications

## Public

- Home
- About
- Products
- Categories
- Contact
- Enquiry
- Legal pages

---

# 4. Major Project Modules

```text
1. Public Website
2. Authentication
3. User Management
4. Roles & Permissions
5. Product Management
6. Category Management
7. Enquiry Management
8. Customer Management
9. Supplier Management
10. Inventory Management
11. Purchase Management
12. Billing & Invoice Management
13. Employee Management
14. Attendance Management
15. Daily Sales Report — DSR
16. Leave Management
17. Payroll
18. Dashboard
19. Reports
20. Notifications
21. Website Content Management
22. Settings
23. Audit Logs
```

---

# 5. Public Website Features

## Home
- Hero section
- Company introduction
- Featured products
- Categories
- Why choose KN Agro
- Testimonials
- CTA
- WhatsApp contact
- Footer

## Products
- Product listing
- Search
- Filter
- Product images
- Product details
- Packaging information
- Product enquiry
- Related products

## Contact
- Contact form
- Phone
- Email
- Address
- Map
- WhatsApp
- Business hours

## Enquiry
Fields:

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

---

# 6. Authentication

```text
Login
Logout
Access token
Refresh token
Forgot password
Reset password
Current user
Account status
Last login
Role validation
Permission validation
```

Redirects:

```text
SUPER_ADMIN → /super-admin/dashboard
ADMIN       → /admin/dashboard
EMPLOYEE    → /employee/dashboard
```

---

# 7. Roles & Permissions

Recommended permissions:

```text
dashboard.read

products.read
products.create
products.update
products.delete

categories.read
categories.manage

enquiries.read
enquiries.manage

customers.read
customers.create
customers.update

suppliers.read
suppliers.create
suppliers.update

inventory.read
inventory.adjust

purchases.read
purchases.create
purchases.update

billing.read
billing.create
billing.update
billing.cancel

employees.read
employees.create
employees.update

attendance.read
attendance.manage

dsr.read
dsr.create
dsr.update
dsr.review
dsr.remind

leave.read
leave.create
leave.approve

payroll.read
payroll.manage

reports.read
notifications.read
notifications.manage
content.manage
users.manage
roles.manage
settings.manage
audit.read
```

---

# 8. Employee Management

Employee data:

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
documents[]
userAccount
requiresDsr
employmentStatus
createdAt
updatedAt
```

Employment status:

```text
ACTIVE
INACTIVE
ON_LEAVE
RESIGNED
TERMINATED
```

---

# 9. Attendance Management

## Employee Features
- Check in
- Check out
- Today's status
- Attendance history
- Monthly calendar
- Working hours
- Late / absent / leave status

## Admin Features
- View all attendance
- Filter by employee/date/department
- Add or correct attendance
- Mark present/absent/leave
- Edit check-in/check-out
- View working hours
- Export attendance

Attendance model:

```text
Attendance
├── employee
├── date
├── checkIn
├── checkOut
├── workingHours
├── status
├── source
├── remarks
├── editedBy
├── createdAt
└── updatedAt
```

Status:

```text
PRESENT
ABSENT
HALF_DAY
LEAVE
HOLIDAY
WEEK_OFF
```

---

# 10. Daily Sales Report — DSR

The employee portal includes a complete DSR workflow.

Employee can:

- Create today's DSR
- Save as draft
- Edit draft
- Upload DSR file
- Submit
- Resubmit after correction
- View previous reports
- View status
- Read admin remarks
- Read reminder notifications

Submission modes:

```text
Structured Form
+
File Upload
```

Allowed upload types can include:

```text
.pdf
.xlsx
.xls
.csv
.jpg
.jpeg
.png
```

---

# 11. DSR Data Model

```text
DSR
├── employee
├── reportDate
├── attendance
├── status
│
├── openingSummary
│
├── customersVisited[]
│   ├── customerName
│   ├── location
│   ├── contactPerson
│   ├── phone
│   ├── visitPurpose
│   ├── discussion
│   ├── result
│   └── followUpDate
│
├── sales[]
│   ├── product
│   ├── productName
│   ├── quantity
│   ├── unit
│   ├── rate
│   ├── amount
│   └── customer
│
├── ordersCollected[]
├── collections[]
├── leadsGenerated[]
├── expenses[]
│
├── marketFeedback
├── competitorFeedback
├── challenges
├── tomorrowPlan
├── employeeRemarks
│
├── attachments[]
│
├── totalSalesAmount
├── totalCollectionAmount
├── totalExpenseAmount
│
├── submittedAt
├── reviewedBy
├── reviewedAt
├── adminRemarks
│
├── reminderCount
├── lastReminderAt
│
├── createdAt
└── updatedAt
```

Statuses:

```text
DRAFT
SUBMITTED
UNDER_REVIEW
APPROVED
NEEDS_CORRECTION
RESUBMITTED
MISSED
```

---

# 12. Attendance + DSR Logic

Business rule:

```text
Employee requires DSR
        +
Attendance = PRESENT / HALF_DAY
        +
DSR not submitted
        ↓
DSR PENDING
```

Possible exception:

```text
Employee on LEAVE
→ DSR not required
```

Employee configuration:

```text
requiresDsr: true / false
```

Example:

```text
Sales Executive → true
Field Officer    → true
Accountant       → false
Office Assistant → false
```

---

# 13. DSR Admin Dashboard

Admin can see:

```text
Total DSR Required
Submitted
Pending
Missed
Approved
Needs Correction
Submission Percentage
Employee-wise Status
```

Recommended DSR table columns:

```text
Employee
Employee Code
Designation
Attendance
Report Date
DSR Status
Submission Time
Sales Amount
Collection Amount
Attachments
Reminder Count
Last Reminder
Review Status
Actions
```

Actions:

```text
View
Review
Approve
Request Correction
Send Reminder
Download Attachment
Export
```

---

# 14. DSR Reminder Message Feature

Admin can generate a reminder for an employee whose DSR is pending.

Flow:

```text
Admin
   ↓
DSR Management
   ↓
Pending DSR
   ↓
Select Employee
   ↓
Generate Reminder
   ↓
System Creates Message
   ↓
Admin Reviews / Edits
   ↓
Send
   ↓
Employee Notification
   ↓
Reminder Logged
```

Default message:

```text
Hello {{employeeName}},

Your Daily Sales Report (DSR) for {{reportDate}} has not yet been submitted.

Please upload and submit your DSR through the KN Agro employee portal at the earliest.

If you have already submitted it, please ignore this message.

Regards,
KN Agro
```

Reminder types:

```text
NORMAL_REMINDER
URGENT_REMINDER
CORRECTION_REMINDER
MISSED_DSR_REMINDER
```

Channels:

```text
IN_APP
EMAIL
SMS
WHATSAPP
```

Initial implementation should always support:

```text
IN_APP
```

---

# 15. Bulk DSR Reminder

Admin can select multiple employees:

```text
Pending Employees
        ↓
Select All / Select Multiple
        ↓
Generate Reminder
        ↓
Send Reminder
```

Each send should create a reminder record.

---

# 16. DSR Reminder Model

```text
DsrReminder
├── dsr
├── employee
├── reportDate
├── type
├── channel
├── message
├── sentBy
├── sentAt
├── deliveryStatus
└── createdAt
```

---

# 17. DSR Review Workflow

```text
Employee submits
      ↓
SUBMITTED
      ↓
Admin reviews
      ├── APPROVED
      └── NEEDS_CORRECTION
               ↓
         Admin remark
               ↓
         Employee notified
               ↓
         Employee edits
               ↓
         RESUBMITTED
               ↓
         Admin approves
```

---

# 18. DSR Reports

Admin reports can include:

- Employee-wise DSR submission
- Daily submission percentage
- Monthly DSR compliance
- Missing DSR report
- Sales employee performance
- Customer visits
- Sales values
- Collections
- Leads generated
- Product-wise sales
- Market feedback
- Expenses

Structured DSR enables:

```text
Employee Sales Trend
Product Sales Trend
Daily Sales
Monthly Sales
Customer Visits
Lead Conversion
Collections
Sales vs Target
Employee Performance
```

---

# 19. Employee Dashboard

Employee dashboard cards:

```text
Today's Attendance
Check In / Check Out
Today's DSR Status
Upload DSR
Pending DSR Reminder
Leave Balance
Latest Payslip
Notifications
```

---

# 20. Admin Dashboard

```text
Today's Sales
Invoices
Outstanding Payments
Low Stock
Employees Present
Employees Absent
Today's DSR Submitted
Today's DSR Pending
Missed DSR
Pending Leave Requests
Recent Enquiries
```

---

# 21. Product Management

```text
Create
Edit
Delete
Activate / Deactivate
Upload Images
Assign Category
Set Unit
Set SKU
Set Price
Set Tax
Set Minimum Stock
Set Featured
```

---

# 22. Customer Management

```text
customerCode
name
company
phone
email
gstNumber
billingAddress
shippingAddress
city
state
pincode
creditLimit
openingBalance
status
```

---

# 23. Supplier Management

```text
supplierCode
name
company
phone
email
gstNumber
address
city
state
pincode
openingBalance
status
```

---

# 24. Inventory Management

Maintain:

```text
Current Stock
+
Stock Movement History
```

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

---

# 25. Purchase Management

Admin can:

- Create purchase
- Select supplier
- Add products
- Quantity
- Rate
- Tax
- Discount
- Payment status
- Receive stock

Flow:

```text
Purchase
   ↓
Inventory Increase
   ↓
PURCHASE Stock Movement
```

---

# 26. Billing

Admin can:

- Create invoice
- Select customer
- Add products
- Quantity
- Price
- Discount
- Tax
- Grand total
- Record payment
- Pending balance
- Print
- PDF
- Cancel invoice

Invoice status:

```text
DRAFT
CONFIRMED
CANCELLED
```

Payment status:

```text
UNPAID
PARTIALLY_PAID
PAID
```

Billing flow:

```text
Invoice Confirmed
      ↓
Billing Service
      ↓
Inventory Service
      ↓
Decrease Stock
      ↓
SALE Stock Movement
```

---

# 27. Leave Management

Employee:

```text
Apply Leave
View Balance
View History
Cancel Pending Request
```

Admin:

```text
View
Approve
Reject
Add Remark
```

Status:

```text
PENDING
APPROVED
REJECTED
CANCELLED
```

---

# 28. Payroll

Payroll supports:

```text
Salary Structure
Attendance Adjustment
Allowances
Deductions
Monthly Payroll
Payslip
Payment Status
```

Flow:

```text
Salary Structure
        +
Attendance
        +
Approved Leave
        +
Allowances
        +
Deductions
        ↓
Payroll
        ↓
Net Salary
        ↓
Payslip
```

---

# 29. Notifications

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

Notification model:

```text
Notification
├── user
├── employee
├── type
├── title
├── message
├── referenceType
├── referenceId
├── isRead
├── readAt
├── createdBy
└── createdAt
```

---

# 30. Reports

```text
Sales Report
Invoice Report
Outstanding Payment Report
Inventory Report
Low Stock Report
Purchase Report
Customer Report
Supplier Report
Employee Report
Attendance Report
DSR Report
DSR Compliance Report
Leave Report
Payroll Report
```

---

# 31. Settings

Super Admin settings:

```text
Business Profile
GST / Tax
Invoice Prefix
Invoice Numbering
Financial Year
Payroll Settings
Attendance Settings
DSR Settings
Notification Settings
File Upload Settings
```

DSR settings:

```text
DSR enabled
submission deadline
allowed file types
maximum file size
allow draft
allow previous-date submission
mark missed automatically
require attendance
reminder message template
DSR required designations
```

---

# 32. Audit Logs

Important events:

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

---

# 33. MongoDB Collections

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

---

# 34. Main Entity Relationships

```text
User
 │
 ├── Role
 └── Employee

Employee
 ├── Attendance
 ├── DSR
 ├── DSR Reminder
 ├── Leave
 └── Payroll

Category
 └── Product
      ├── Inventory
      ├── StockMovement
      ├── Purchase
      └── Invoice

Customer
 └── Invoice
      └── Payment

Supplier
 └── Purchase
```

---

# 35. Complete Frontend Structure

```text
frontend/
│
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   ├── sitemap.xml
│   └── assets/
│       ├── images/
│       └── icons/
│
├── src/
│   ├── app/
│   │   ├── App.jsx
│   │   ├── AppProviders.jsx
│   │   ├── router.jsx
│   │   ├── routeConfig.js
│   │   └── queryClient.js
│   │
│   ├── api/
│   │   ├── axiosClient.js
│   │   ├── apiEndpoints.js
│   │   ├── requestInterceptor.js
│   │   └── responseInterceptor.js
│   │
│   ├── routes/
│   │   ├── PublicRoute.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── SuperAdminRoute.jsx
│   │   ├── AdminRoute.jsx
│   │   ├── EmployeeRoute.jsx
│   │   ├── RoleRoute.jsx
│   │   └── PermissionRoute.jsx
│   │
│   ├── layouts/
│   │   ├── PublicLayout.jsx
│   │   ├── AuthLayout.jsx
│   │   ├── SuperAdminLayout.jsx
│   │   ├── AdminLayout.jsx
│   │   ├── EmployeeLayout.jsx
│   │   └── PrintLayout.jsx
│   │
│   ├── modules/
│   │   ├── super-admin/
│   │   │   ├── dashboard/
│   │   │   ├── admins/
│   │   │   ├── roles-permissions/
│   │   │   ├── business-settings/
│   │   │   ├── audit-logs/
│   │   │   ├── reports/
│   │   │   └── system/
│   │   │
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   ├── products/
│   │   │   ├── categories/
│   │   │   ├── enquiries/
│   │   │   ├── customers/
│   │   │   ├── suppliers/
│   │   │   ├── inventory/
│   │   │   ├── purchases/
│   │   │   ├── billing/
│   │   │   ├── employees/
│   │   │   ├── attendance/
│   │   │   ├── dsr/
│   │   │   ├── leave-management/
│   │   │   ├── payroll/
│   │   │   ├── notifications/
│   │   │   ├── reports/
│   │   │   └── website-content/
│   │   │
│   │   ├── public/
│   │   │   ├── home/
│   │   │   ├── products/
│   │   │   ├── categories/
│   │   │   ├── enquiries/
│   │   │   ├── about/
│   │   │   ├── contact/
│   │   │   └── legal/
│   │   │
│   │   ├── employee/
│   │   │   ├── dashboard/
│   │   │   ├── profile/
│   │   │   ├── attendance/
│   │   │   ├── dsr/
│   │   │   ├── leave/
│   │   │   ├── payroll/
│   │   │   └── notifications/
│   │   │
│   │   └── auth/
│   │
│   ├── shared/
│   │   ├── components/
│   │   ├── navigation/
│   │   ├── forms/
│   │   └── feedback/
│   │
│   ├── hooks/
│   ├── context/
│   ├── store/
│   ├── constants/
│   ├── config/
│   ├── utils/
│   ├── assets/
│   ├── main.jsx
│   └── index.css
│
├── .env.example
├── eslint.config.js
├── index.html
├── package.json
└── vite.config.js
```

---

# 36. Admin DSR Frontend Structure

```text
frontend/src/modules/admin/dsr/
├── api/
│   └── dsr.api.js
├── components/
│   ├── DsrSummaryCards.jsx
│   ├── DsrTable.jsx
│   ├── DsrFilters.jsx
│   ├── DsrDetails.jsx
│   ├── DsrReviewForm.jsx
│   ├── DsrStatusBadge.jsx
│   ├── DsrAttachmentList.jsx
│   ├── DsrReminderModal.jsx
│   ├── DsrReminderMessage.jsx
│   ├── BulkDsrReminderModal.jsx
│   └── DsrComplianceChart.jsx
└── pages/
    ├── DsrDashboardPage.jsx
    ├── DsrListPage.jsx
    ├── DsrDetailsPage.jsx
    ├── PendingDsrPage.jsx
    ├── MissedDsrPage.jsx
    └── DsrReportsPage.jsx
```

---

# 37. Employee DSR Frontend Structure

```text
frontend/src/modules/employee/dsr/
├── api/
│   └── employeeDsr.api.js
├── components/
│   ├── TodayDsrCard.jsx
│   ├── DsrForm.jsx
│   ├── CustomerVisitsForm.jsx
│   ├── SalesItemsForm.jsx
│   ├── CollectionsForm.jsx
│   ├── LeadsForm.jsx
│   ├── ExpensesForm.jsx
│   ├── DsrFileUploader.jsx
│   ├── DsrStatusBadge.jsx
│   ├── DsrHistoryTable.jsx
│   └── DsrReminderBanner.jsx
└── pages/
    ├── MyDsrPage.jsx
    ├── CreateDsrPage.jsx
    ├── EditDsrPage.jsx
    ├── DsrDetailsPage.jsx
    └── DsrHistoryPage.jsx
```

---

# 38. Complete Backend Structure

```text
backend/
│
├── src/
│   ├── app.js
│   ├── server.js
│   │
│   ├── config/
│   │   ├── env.config.js
│   │   ├── db.config.js
│   │   ├── cors.config.js
│   │   ├── logger.config.js
│   │   ├── upload.config.js
│   │   ├── auth.config.js
│   │   └── constants.config.js
│   │
│   ├── database/
│   │   ├── connection.js
│   │   └── indexes.js
│   │
│   ├── routes/
│   │   ├── index.js
│   │   ├── public.routes.js
│   │   ├── protected.routes.js
│   │   └── health.routes.js
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── roles/
│   │   ├── products/
│   │   ├── categories/
│   │   ├── enquiries/
│   │   ├── customers/
│   │   ├── suppliers/
│   │   ├── inventory/
│   │   ├── purchases/
│   │   ├── billing/
│   │   ├── employees/
│   │   ├── attendance/
│   │   ├── dsr/
│   │   ├── leave/
│   │   ├── payroll/
│   │   ├── dashboard/
│   │   ├── reports/
│   │   ├── notifications/
│   │   ├── content/
│   │   ├── settings/
│   │   └── audit/
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   ├── permission.middleware.js
│   │   ├── validate.middleware.js
│   │   ├── ownership.middleware.js
│   │   ├── error.middleware.js
│   │   ├── notFound.middleware.js
│   │   ├── rateLimit.middleware.js
│   │   ├── requestId.middleware.js
│   │   ├── requestLogger.middleware.js
│   │   ├── upload.middleware.js
│   │   └── audit.middleware.js
│   │
│   ├── shared/
│   │   ├── errors/
│   │   ├── responses/
│   │   ├── validators/
│   │   ├── constants/
│   │   └── helpers/
│   │
│   ├── services/
│   │   ├── email.service.js
│   │   ├── sms.service.js
│   │   ├── whatsapp.service.js
│   │   ├── notificationDelivery.service.js
│   │   ├── fileStorage.service.js
│   │   ├── pdf.service.js
│   │   ├── export.service.js
│   │   └── token.service.js
│   │
│   ├── utils/
│   │
│   ├── templates/
│   │   ├── emails/
│   │   ├── messages/
│   │   │   ├── dsrReminder.template.js
│   │   │   ├── dsrUrgentReminder.template.js
│   │   │   └── dsrCorrection.template.js
│   │   └── pdf/
│   │
│   └── docs/
│
├── storage/
│   ├── uploads/
│   │   ├── products/
│   │   ├── employees/
│   │   ├── invoices/
│   │   ├── dsr/
│   │   └── documents/
│   └── exports/
│
├── logs/
├── .env.example
├── eslint.config.js
├── package.json
└── package-lock.json
```

---

# 39. Backend DSR Module Structure

```text
backend/src/modules/dsr/
├── dsr.model.js
├── dsrReminder.model.js
├── dsr.controller.js
├── dsr.service.js
├── dsr.repository.js
├── dsrReminder.repository.js
├── dsr.validation.js
├── dsr.routes.js
├── dsr.constants.js
├── dsr.mapper.js
├── dsr.policy.js
├── dsrReminder.service.js
├── dsrCompliance.service.js
└── dsrFile.service.js
```

Responsibilities:

```text
dsr.service.js
→ create, draft, submit, resubmit, approve, correction, totals

dsrReminder.service.js
→ generate/send/bulk reminders and log them

dsrCompliance.service.js
→ pending, missed, compliance %, attendance-vs-DSR

dsrFile.service.js
→ secure DSR attachments
```

---

# 40. DSR API Endpoints

Employee:

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

Admin:

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

---

# 41. Reminder API Example

```text
POST /api/v1/dsr/reminders
```

```json
{
  "employeeId": "EMPLOYEE_ID",
  "reportDate": "2026-08-22",
  "type": "NORMAL_REMINDER",
  "channel": "IN_APP"
}
```

Bulk:

```json
{
  "employeeIds": [
    "EMPLOYEE_1",
    "EMPLOYEE_2"
  ],
  "reportDate": "2026-08-22",
  "type": "NORMAL_REMINDER",
  "channel": "IN_APP"
}
```

---

# 42. DSR Security Rules

Employees must access only their own DSR.

Use:

```text
GET /api/v1/dsr/me
```

Backend resolves:

```js
const employeeId = req.user.employeeId;
```

File uploads must validate:

```text
extension
MIME type
file size
DSR ownership
employee ownership
upload count
```

Recommended initial file size:

```text
5–10 MB
```

configurable in settings.

---

# 43. DSR Storage

```text
storage/uploads/dsr/
└── <employeeId>/
    └── <year>/
        └── <month>/
            └── <reportDate>/
```

Production can replace local storage with cloud storage without changing DSR business logic.

---

# 44. DSR Database Indexes

Recommended:

```text
employee + reportDate UNIQUE
reportDate + status
employee + status
reportDate + submittedAt
```

Attendance:

```text
employee + date UNIQUE
date + status
employee + date
```

---

# 45. Frontend URLs

Public:

```text
/
/about
/products
/products/:slug
/categories
/contact
/enquiry
```

Super Admin:

```text
/super-admin/dashboard
/super-admin/admins
/super-admin/roles
/super-admin/permissions
/super-admin/reports
/super-admin/settings
/super-admin/audit-logs
/super-admin/system
```

Admin:

```text
/admin/dashboard
/admin/products
/admin/categories
/admin/enquiries
/admin/customers
/admin/suppliers
/admin/inventory
/admin/purchases
/admin/invoices
/admin/employees
/admin/attendance
/admin/dsr
/admin/dsr/pending
/admin/dsr/missed
/admin/dsr/:id
/admin/dsr/reports
/admin/leave
/admin/payroll
/admin/reports
/admin/content
```

Employee:

```text
/employee/dashboard
/employee/profile
/employee/attendance
/employee/dsr
/employee/dsr/today
/employee/dsr/create
/employee/dsr/:id
/employee/dsr/:id/edit
/employee/dsr/history
/employee/leave
/employee/payroll
/employee/notifications
```

---

# 46. Example Employee Daily Flow

```text
Login
  ↓
Dashboard
  ↓
Check In
  ↓
Work / Visits
  ↓
Open Today's DSR
  ↓
Add Customer Visits
  ↓
Add Sales
  ↓
Add Collections
  ↓
Add Leads
  ↓
Add Feedback
  ↓
Upload Attachment
  ↓
Submit DSR
  ↓
Check Out
```

---

# 47. Example Admin Pending DSR Flow

```text
Employee Present
      ↓
DSR Missing
      ↓
Admin sees PENDING
      ↓
Admin selects employee
      ↓
Generate Reminder
      ↓
Edit if needed
      ↓
Send
      ↓
Employee Notification
      ↓
Employee submits
```

---

# 48. Backend Request Flow

```text
Request
 ↓
Route
 ↓
Authentication
 ↓
Permission
 ↓
Ownership / Policy
 ↓
Validation
 ↓
Controller
 ↓
Service
 ↓
Repository
 ↓
Model
 ↓
MongoDB
```

---

# 49. Cross-Feature Calls

Allowed:

```text
billing.service → inventory.service
purchase.service → inventory.service
payroll.service → attendance.service
dsr.service → attendance.service
dsrReminder.service → notification.service
```

Never:

```text
service → controller
```

---

# 50. Security

```text
Helmet
CORS
Rate Limiting
Input Validation
MongoDB Sanitization
JWT
Refresh Tokens
Password Hashing
RBAC
Permissions
Ownership Validation
Policy Checks
Upload Validation
Audit Logging
Request IDs
Central Error Handler
```

---

# 51. Development Phases

```text
PHASE 1
Foundation + React + Express + MongoDB + shared architecture

PHASE 2
Authentication + Users + Roles + Permissions

PHASE 3
Public Website + Products + Categories + Content + Enquiries

PHASE 4
Customers + Suppliers + Inventory + Purchases

PHASE 5
Billing + Payments + PDF + Inventory Integration

PHASE 6
Employees + Employee Portal + Attendance + Leave

PHASE 7
DSR
├── Employee DSR
├── DSR Upload
├── DSR History
├── Admin DSR Dashboard
├── DSR Review
├── Pending DSR
├── Missed DSR
├── Reminder Message Generator
├── Bulk Reminder
├── Notifications
└── Compliance Reports

PHASE 8
Payroll

PHASE 9
Dashboards + Reports + Notifications + Audit + Settings
```

---

# 52. Final Architecture Summary

```text
FRONTEND
→ Role-Based
   ├── Super Admin
   ├── Admin
   ├── Public
   └── Employee

BACKEND
→ Feature-Oriented Modular
   ├── Auth
   ├── Products
   ├── Inventory
   ├── Billing
   ├── Employees
   ├── Attendance
   ├── DSR
   ├── Leave
   ├── Payroll
   └── Reports

EMPLOYEE OPERATIONS
→ Attendance + DSR + Leave + Payroll

ADMIN OPERATIONS
→ Management + Review + Reminder + Reporting

DATABASE
→ One Business Source of Truth

AUTHORIZATION
→ Role + Permission + Ownership + Policy
```

The DSR feature is a first-class part of employee management, allowing the system to answer every day:

```text
Who was present?
Who was required to submit a DSR?
Who submitted?
Who is pending?
Who missed?
Who needs correction?
Who was reminded?
What sales, visits, collections and feedback were reported?
```

This keeps employee attendance, daily field work, sales reporting and management follow-up inside one unified MERN system.
