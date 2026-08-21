# KN Agro — Final Hybrid MERN File Structure

> **Frontend:** Role-Based Architecture  
> **Backend:** Feature-Oriented Modular Architecture  
> **Stack:** React.js + JavaScript + Node.js + Express.js + MongoDB  
> **Architecture Style:** Hybrid Modular Monolith  
> **Primary Frontend Roles:** Super Admin, Admin, Public, Employee  
> **Goal:** Scalable, maintainable, secure, low-duplication, implementation-ready

---

# 1. Final Architecture Decision

This project uses a hybrid architecture:

```text
FRONTEND
→ organized by WHO uses the system

BACKEND
→ organized by WHAT business feature is being executed
```

So:

```text
Frontend
├── super-admin/
├── admin/
├── public/
└── employee/
```

while backend uses:

```text
Backend
├── auth/
├── users/
├── products/
├── categories/
├── inventory/
├── billing/
├── employees/
├── attendance/
├── leave/
├── payroll/
└── reports/
```

This avoids backend duplication such as:

```text
admin/products/
public/products/
super-admin/products/
```

while still giving the frontend clear role separation.

---

# 2. Root Project Structure

```text
kn-agro/
│
├── frontend/
├── backend/
│
├── .gitignore
├── README.md
├── package.json
└── package-lock.json
```

---

# 3. Complete Frontend Structure — Role Based

```text
frontend/
│
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── manifest.json
│   │
│   └── assets/
│       ├── images/
│       │   ├── brand/
│       │   ├── products/
│       │   ├── categories/
│       │   ├── banners/
│       │   ├── agriculture/
│       │   ├── employees/
│       │   └── placeholders/
│       │
│       └── icons/
│
├── src/
│   │
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
│   │   │
│   │   ├── super-admin/
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── api/
│   │   │   │   │   └── superAdminDashboard.api.js
│   │   │   │   ├── components/
│   │   │   │   │   ├── GlobalStats.jsx
│   │   │   │   │   ├── RevenueOverview.jsx
│   │   │   │   │   ├── EmployeeOverview.jsx
│   │   │   │   │   ├── InventoryOverview.jsx
│   │   │   │   │   ├── BillingOverview.jsx
│   │   │   │   │   └── RecentActivities.jsx
│   │   │   │   └── pages/
│   │   │   │       └── SuperAdminDashboardPage.jsx
│   │   │   │
│   │   │   ├── admins/
│   │   │   │   ├── api/
│   │   │   │   │   └── admins.api.js
│   │   │   │   ├── components/
│   │   │   │   │   ├── AdminForm.jsx
│   │   │   │   │   ├── AdminTable.jsx
│   │   │   │   │   ├── AdminDetails.jsx
│   │   │   │   │   └── AdminStatusBadge.jsx
│   │   │   │   └── pages/
│   │   │   │       ├── AdminsPage.jsx
│   │   │   │       ├── CreateAdminPage.jsx
│   │   │   │       ├── EditAdminPage.jsx
│   │   │   │       └── AdminDetailsPage.jsx
│   │   │   │
│   │   │   ├── roles-permissions/
│   │   │   │   ├── api/
│   │   │   │   │   └── rolesPermissions.api.js
│   │   │   │   ├── components/
│   │   │   │   │   ├── RoleForm.jsx
│   │   │   │   │   ├── RoleTable.jsx
│   │   │   │   │   └── PermissionMatrix.jsx
│   │   │   │   └── pages/
│   │   │   │       └── RolesPermissionsPage.jsx
│   │   │   │
│   │   │   ├── business-settings/
│   │   │   │   ├── api/
│   │   │   │   │   └── businessSettings.api.js
│   │   │   │   ├── components/
│   │   │   │   │   ├── BusinessProfileForm.jsx
│   │   │   │   │   ├── TaxSettingsForm.jsx
│   │   │   │   │   ├── InvoiceSettingsForm.jsx
│   │   │   │   │   ├── PayrollSettingsForm.jsx
│   │   │   │   │   └── NotificationSettingsForm.jsx
│   │   │   │   └── pages/
│   │   │   │       └── BusinessSettingsPage.jsx
│   │   │   │
│   │   │   ├── audit-logs/
│   │   │   │   ├── api/
│   │   │   │   │   └── auditLogs.api.js
│   │   │   │   ├── components/
│   │   │   │   │   ├── AuditLogTable.jsx
│   │   │   │   │   └── AuditLogFilters.jsx
│   │   │   │   └── pages/
│   │   │   │       └── AuditLogsPage.jsx
│   │   │   │
│   │   │   ├── reports/
│   │   │   │   ├── api/
│   │   │   │   │   └── superAdminReports.api.js
│   │   │   │   ├── components/
│   │   │   │   │   ├── RevenueReport.jsx
│   │   │   │   │   ├── SalesReport.jsx
│   │   │   │   │   ├── InventoryReport.jsx
│   │   │   │   │   ├── PayrollReport.jsx
│   │   │   │   │   └── EmployeeReport.jsx
│   │   │   │   └── pages/
│   │   │   │       └── SuperAdminReportsPage.jsx
│   │   │   │
│   │   │   └── system/
│   │   │       ├── api/
│   │   │       │   └── system.api.js
│   │   │       ├── components/
│   │   │       │   ├── SystemHealthCard.jsx
│   │   │       │   ├── DatabaseStatus.jsx
│   │   │       │   └── ActivitySummary.jsx
│   │   │       └── pages/
│   │   │           └── SystemPage.jsx
│   │   │
│   │   ├── admin/
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── api/
│   │   │   │   │   └── adminDashboard.api.js
│   │   │   │   ├── components/
│   │   │   │   │   ├── SalesSummary.jsx
│   │   │   │   │   ├── StockSummary.jsx
│   │   │   │   │   ├── EmployeeSummary.jsx
│   │   │   │   │   ├── EnquirySummary.jsx
│   │   │   │   │   └── RecentInvoices.jsx
│   │   │   │   └── pages/
│   │   │   │       └── AdminDashboardPage.jsx
│   │   │   │
│   │   │   ├── products/
│   │   │   │   ├── api/
│   │   │   │   │   └── products.api.js
│   │   │   │   ├── components/
│   │   │   │   │   ├── ProductForm.jsx
│   │   │   │   │   ├── ProductTable.jsx
│   │   │   │   │   ├── ProductFilters.jsx
│   │   │   │   │   ├── ProductImages.jsx
│   │   │   │   │   └── ProductStatusBadge.jsx
│   │   │   │   └── pages/
│   │   │   │       ├── ProductsPage.jsx
│   │   │   │       ├── CreateProductPage.jsx
│   │   │   │       ├── EditProductPage.jsx
│   │   │   │       └── ProductDetailsPage.jsx
│   │   │   │
│   │   │   ├── categories/
│   │   │   │   ├── api/
│   │   │   │   │   └── categories.api.js
│   │   │   │   ├── components/
│   │   │   │   │   ├── CategoryForm.jsx
│   │   │   │   │   └── CategoryTable.jsx
│   │   │   │   └── pages/
│   │   │   │       └── CategoriesPage.jsx
│   │   │   │
│   │   │   ├── enquiries/
│   │   │   │   ├── api/
│   │   │   │   │   └── enquiries.api.js
│   │   │   │   ├── components/
│   │   │   │   │   ├── EnquiryTable.jsx
│   │   │   │   │   ├── EnquiryDetails.jsx
│   │   │   │   │   └── EnquiryStatus.jsx
│   │   │   │   └── pages/
│   │   │   │       ├── EnquiriesPage.jsx
│   │   │   │       └── EnquiryDetailsPage.jsx
│   │   │   │
│   │   │   ├── customers/
│   │   │   │   ├── api/
│   │   │   │   │   └── customers.api.js
│   │   │   │   ├── components/
│   │   │   │   │   ├── CustomerForm.jsx
│   │   │   │   │   ├── CustomerTable.jsx
│   │   │   │   │   └── CustomerSummary.jsx
│   │   │   │   └── pages/
│   │   │   │       ├── CustomersPage.jsx
│   │   │   │       └── CustomerDetailsPage.jsx
│   │   │   │
│   │   │   ├── suppliers/
│   │   │   │   ├── api/
│   │   │   │   │   └── suppliers.api.js
│   │   │   │   ├── components/
│   │   │   │   │   ├── SupplierForm.jsx
│   │   │   │   │   └── SupplierTable.jsx
│   │   │   │   └── pages/
│   │   │   │       ├── SuppliersPage.jsx
│   │   │   │       └── SupplierDetailsPage.jsx
│   │   │   │
│   │   │   ├── inventory/
│   │   │   │   ├── api/
│   │   │   │   │   └── inventory.api.js
│   │   │   │   ├── components/
│   │   │   │   │   ├── StockTable.jsx
│   │   │   │   │   ├── StockAdjustmentForm.jsx
│   │   │   │   │   ├── StockMovementTable.jsx
│   │   │   │   │   ├── LowStockList.jsx
│   │   │   │   │   └── InventorySummary.jsx
│   │   │   │   └── pages/
│   │   │   │       ├── InventoryPage.jsx
│   │   │   │       ├── StockMovementsPage.jsx
│   │   │   │       └── StockAdjustmentsPage.jsx
│   │   │   │
│   │   │   ├── purchases/
│   │   │   │   ├── api/
│   │   │   │   │   └── purchases.api.js
│   │   │   │   ├── components/
│   │   │   │   │   ├── PurchaseForm.jsx
│   │   │   │   │   ├── PurchaseItems.jsx
│   │   │   │   │   └── PurchaseTable.jsx
│   │   │   │   └── pages/
│   │   │   │       ├── PurchasesPage.jsx
│   │   │   │       ├── CreatePurchasePage.jsx
│   │   │   │       └── PurchaseDetailsPage.jsx
│   │   │   │
│   │   │   ├── billing/
│   │   │   │   ├── api/
│   │   │   │   │   └── billing.api.js
│   │   │   │   ├── components/
│   │   │   │   │   ├── InvoiceForm.jsx
│   │   │   │   │   ├── InvoiceItems.jsx
│   │   │   │   │   ├── InvoiceTable.jsx
│   │   │   │   │   ├── InvoicePreview.jsx
│   │   │   │   │   ├── InvoiceTotals.jsx
│   │   │   │   │   ├── TaxSummary.jsx
│   │   │   │   │   ├── PaymentForm.jsx
│   │   │   │   │   └── PaymentHistory.jsx
│   │   │   │   └── pages/
│   │   │   │       ├── InvoicesPage.jsx
│   │   │   │       ├── CreateInvoicePage.jsx
│   │   │   │       ├── EditInvoicePage.jsx
│   │   │   │       ├── InvoiceDetailsPage.jsx
│   │   │   │       └── PrintInvoicePage.jsx
│   │   │   │
│   │   │   ├── employees/
│   │   │   │   ├── api/
│   │   │   │   │   └── employees.api.js
│   │   │   │   ├── components/
│   │   │   │   │   ├── EmployeeForm.jsx
│   │   │   │   │   ├── EmployeeTable.jsx
│   │   │   │   │   ├── EmployeeProfile.jsx
│   │   │   │   │   └── EmployeeDocuments.jsx
│   │   │   │   └── pages/
│   │   │   │       ├── EmployeesPage.jsx
│   │   │   │       ├── EmployeeDetailsPage.jsx
│   │   │   │       ├── CreateEmployeePage.jsx
│   │   │   │       └── EditEmployeePage.jsx
│   │   │   │
│   │   │   ├── attendance/
│   │   │   │   ├── api/
│   │   │   │   │   └── attendance.api.js
│   │   │   │   ├── components/
│   │   │   │   │   ├── AttendanceTable.jsx
│   │   │   │   │   ├── AttendanceForm.jsx
│   │   │   │   │   ├── AttendanceCalendar.jsx
│   │   │   │   │   └── AttendanceSummary.jsx
│   │   │   │   └── pages/
│   │   │   │       ├── AttendancePage.jsx
│   │   │   │       └── AttendanceHistoryPage.jsx
│   │   │   │
│   │   │   ├── leave-management/
│   │   │   │   ├── api/
│   │   │   │   │   └── leaveManagement.api.js
│   │   │   │   ├── components/
│   │   │   │   │   ├── LeaveRequestTable.jsx
│   │   │   │   │   ├── LeaveDetails.jsx
│   │   │   │   │   └── LeaveApprovalActions.jsx
│   │   │   │   └── pages/
│   │   │   │       ├── LeaveRequestsPage.jsx
│   │   │   │       └── LeaveApprovalsPage.jsx
│   │   │   │
│   │   │   ├── payroll/
│   │   │   │   ├── api/
│   │   │   │   │   └── payroll.api.js
│   │   │   │   ├── components/
│   │   │   │   │   ├── PayrollTable.jsx
│   │   │   │   │   ├── SalaryStructureForm.jsx
│   │   │   │   │   ├── PayrollSummary.jsx
│   │   │   │   │   └── PayslipPreview.jsx
│   │   │   │   └── pages/
│   │   │   │       ├── PayrollPage.jsx
│   │   │   │       ├── SalarySettingsPage.jsx
│   │   │   │       └── PayslipPage.jsx
│   │   │   │
│   │   │   ├── reports/
│   │   │   │   ├── api/
│   │   │   │   │   └── adminReports.api.js
│   │   │   │   ├── components/
│   │   │   │   │   ├── SalesReport.jsx
│   │   │   │   │   ├── InventoryReport.jsx
│   │   │   │   │   ├── BillingReport.jsx
│   │   │   │   │   └── EmployeeReport.jsx
│   │   │   │   └── pages/
│   │   │   │       └── AdminReportsPage.jsx
│   │   │   │
│   │   │   └── website-content/
│   │   │       ├── api/
│   │   │       │   └── websiteContent.api.js
│   │   │       ├── components/
│   │   │       │   ├── BannerForm.jsx
│   │   │       │   ├── TestimonialForm.jsx
│   │   │       │   ├── AboutContentForm.jsx
│   │   │       │   └── ContactContentForm.jsx
│   │   │       └── pages/
│   │   │           └── WebsiteContentPage.jsx
│   │   │
│   │   ├── public/
│   │   │   │
│   │   │   ├── home/
│   │   │   │   ├── components/
│   │   │   │   │   ├── HeroSection.jsx
│   │   │   │   │   ├── FeaturedProducts.jsx
│   │   │   │   │   ├── ProductCategories.jsx
│   │   │   │   │   ├── WhyChooseUs.jsx
│   │   │   │   │   ├── CompanyIntro.jsx
│   │   │   │   │   ├── Testimonials.jsx
│   │   │   │   │   └── CTASection.jsx
│   │   │   │   └── pages/
│   │   │   │       └── HomePage.jsx
│   │   │   │
│   │   │   ├── products/
│   │   │   │   ├── api/
│   │   │   │   │   └── publicProducts.api.js
│   │   │   │   ├── components/
│   │   │   │   │   ├── ProductCard.jsx
│   │   │   │   │   ├── ProductGrid.jsx
│   │   │   │   │   ├── ProductFilters.jsx
│   │   │   │   │   ├── ProductSearch.jsx
│   │   │   │   │   └── ProductDetails.jsx
│   │   │   │   └── pages/
│   │   │   │       ├── ProductsPage.jsx
│   │   │   │       └── ProductDetailsPage.jsx
│   │   │   │
│   │   │   ├── categories/
│   │   │   │   ├── api/
│   │   │   │   │   └── publicCategories.api.js
│   │   │   │   ├── components/
│   │   │   │   │   └── CategoryCard.jsx
│   │   │   │   └── pages/
│   │   │   │       └── CategoriesPage.jsx
│   │   │   │
│   │   │   ├── enquiries/
│   │   │   │   ├── api/
│   │   │   │   │   └── publicEnquiries.api.js
│   │   │   │   ├── components/
│   │   │   │   │   └── EnquiryForm.jsx
│   │   │   │   └── pages/
│   │   │   │       └── EnquiryPage.jsx
│   │   │   │
│   │   │   ├── about/
│   │   │   │   └── pages/
│   │   │   │       └── AboutPage.jsx
│   │   │   │
│   │   │   ├── contact/
│   │   │   │   ├── components/
│   │   │   │   │   └── ContactForm.jsx
│   │   │   │   └── pages/
│   │   │   │       └── ContactPage.jsx
│   │   │   │
│   │   │   └── legal/
│   │   │       └── pages/
│   │   │           ├── PrivacyPolicyPage.jsx
│   │   │           └── TermsPage.jsx
│   │   │
│   │   ├── employee/
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── api/
│   │   │   │   │   └── employeeDashboard.api.js
│   │   │   │   ├── components/
│   │   │   │   │   ├── AttendanceCard.jsx
│   │   │   │   │   ├── LeaveBalanceCard.jsx
│   │   │   │   │   ├── SalaryCard.jsx
│   │   │   │   │   ├── AnnouncementsCard.jsx
│   │   │   │   │   └── QuickActions.jsx
│   │   │   │   └── pages/
│   │   │   │       └── EmployeeDashboardPage.jsx
│   │   │   │
│   │   │   ├── profile/
│   │   │   │   ├── api/
│   │   │   │   │   └── employeeProfile.api.js
│   │   │   │   ├── components/
│   │   │   │   │   ├── ProfileDetails.jsx
│   │   │   │   │   ├── ProfileEditForm.jsx
│   │   │   │   │   └── DocumentsList.jsx
│   │   │   │   └── pages/
│   │   │   │       └── EmployeeProfilePage.jsx
│   │   │   │
│   │   │   ├── attendance/
│   │   │   │   ├── api/
│   │   │   │   │   └── employeeAttendance.api.js
│   │   │   │   ├── components/
│   │   │   │   │   ├── CheckInOutCard.jsx
│   │   │   │   │   ├── AttendanceCalendar.jsx
│   │   │   │   │   └── AttendanceHistory.jsx
│   │   │   │   └── pages/
│   │   │   │       └── MyAttendancePage.jsx
│   │   │   │
│   │   │   ├── leave/
│   │   │   │   ├── api/
│   │   │   │   │   └── employeeLeave.api.js
│   │   │   │   ├── components/
│   │   │   │   │   ├── LeaveRequestForm.jsx
│   │   │   │   │   ├── LeaveBalance.jsx
│   │   │   │   │   └── LeaveHistory.jsx
│   │   │   │   └── pages/
│   │   │   │       └── MyLeavePage.jsx
│   │   │   │
│   │   │   ├── payroll/
│   │   │   │   ├── api/
│   │   │   │   │   └── employeePayroll.api.js
│   │   │   │   ├── components/
│   │   │   │   │   ├── SalarySummary.jsx
│   │   │   │   │   ├── PayslipList.jsx
│   │   │   │   │   └── PayslipPreview.jsx
│   │   │   │   └── pages/
│   │   │   │       └── MyPayrollPage.jsx
│   │   │   │
│   │   │   └── notifications/
│   │   │       ├── api/
│   │   │       │   └── employeeNotifications.api.js
│   │   │       ├── components/
│   │   │       │   └── NotificationList.jsx
│   │   │       └── pages/
│   │   │           └── EmployeeNotificationsPage.jsx
│   │   │
│   │   └── auth/
│   │       ├── api/
│   │       │   └── auth.api.js
│   │       ├── components/
│   │       │   ├── LoginForm.jsx
│   │       │   ├── ForgotPasswordForm.jsx
│   │       │   └── ResetPasswordForm.jsx
│   │       ├── hooks/
│   │       │   └── useAuth.js
│   │       └── pages/
│   │           ├── LoginPage.jsx
│   │           ├── ForgotPasswordPage.jsx
│   │           └── ResetPasswordPage.jsx
│   │
│   ├── shared/
│   │   │
│   │   ├── components/
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Select/
│   │   │   ├── TextArea/
│   │   │   ├── Modal/
│   │   │   ├── Drawer/
│   │   │   ├── Dropdown/
│   │   │   ├── Tabs/
│   │   │   ├── Badge/
│   │   │   ├── Tooltip/
│   │   │   ├── Avatar/
│   │   │   ├── SearchBox/
│   │   │   ├── Pagination/
│   │   │   ├── DataTable/
│   │   │   ├── EmptyState/
│   │   │   ├── Loader/
│   │   │   ├── Skeleton/
│   │   │   ├── ErrorState/
│   │   │   ├── ConfirmDialog/
│   │   │   └── FileUploader/
│   │   │
│   │   ├── navigation/
│   │   │   ├── PublicNavbar.jsx
│   │   │   ├── SuperAdminSidebar.jsx
│   │   │   ├── AdminSidebar.jsx
│   │   │   ├── EmployeeSidebar.jsx
│   │   │   ├── Topbar.jsx
│   │   │   └── MobileMenu.jsx
│   │   │
│   │   ├── forms/
│   │   │   ├── FormField.jsx
│   │   │   ├── FormSection.jsx
│   │   │   ├── FormActions.jsx
│   │   │   └── FormError.jsx
│   │   │
│   │   └── feedback/
│   │       ├── Toast.jsx
│   │       ├── Alert.jsx
│   │       └── InlineError.jsx
│   │
│   ├── hooks/
│   │   ├── useApi.js
│   │   ├── useDebounce.js
│   │   ├── usePagination.js
│   │   ├── usePermissions.js
│   │   ├── useLocalStorage.js
│   │   ├── useMediaQuery.js
│   │   └── useDocumentTitle.js
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── ThemeContext.jsx
│   │   └── NotificationContext.jsx
│   │
│   ├── store/
│   │   ├── index.js
│   │   ├── auth.store.js
│   │   └── ui.store.js
│   │
│   ├── constants/
│   │   ├── app.constants.js
│   │   ├── roles.constants.js
│   │   ├── permissions.constants.js
│   │   ├── status.constants.js
│   │   └── invoice.constants.js
│   │
│   ├── config/
│   │   ├── env.js
│   │   ├── navigation.config.js
│   │   ├── permissions.config.js
│   │   └── roleMenus.config.js
│   │
│   ├── utils/
│   │   ├── formatCurrency.js
│   │   ├── formatDate.js
│   │   ├── formatNumber.js
│   │   ├── buildQueryString.js
│   │   ├── downloadFile.js
│   │   ├── printDocument.js
│   │   ├── permissionHelpers.js
│   │   └── validationHelpers.js
│   │
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── styles/
│   │       ├── globals.css
│   │       ├── variables.css
│   │       ├── typography.css
│   │       ├── utilities.css
│   │       └── animations.css
│   │
│   ├── main.jsx
│   └── index.css
│
├── .env.example
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
└── vite.config.js
```

---

# 4. Complete Backend Structure — Feature-Oriented Modular

```text
backend/
│
├── src/
│   │
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
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   ├── auth.repository.js
│   │   │   ├── auth.validation.js
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.constants.js
│   │   │   └── auth.mapper.js
│   │   │
│   │   ├── users/
│   │   │   ├── user.model.js
│   │   │   ├── user.controller.js
│   │   │   ├── user.service.js
│   │   │   ├── user.repository.js
│   │   │   ├── user.validation.js
│   │   │   ├── user.routes.js
│   │   │   ├── user.constants.js
│   │   │   └── user.mapper.js
│   │   │
│   │   ├── roles/
│   │   │   ├── role.model.js
│   │   │   ├── role.controller.js
│   │   │   ├── role.service.js
│   │   │   ├── role.repository.js
│   │   │   ├── role.validation.js
│   │   │   ├── role.routes.js
│   │   │   └── permission.constants.js
│   │   │
│   │   ├── products/
│   │   │   ├── product.model.js
│   │   │   ├── product.controller.js
│   │   │   ├── product.service.js
│   │   │   ├── product.repository.js
│   │   │   ├── product.validation.js
│   │   │   ├── product.routes.js
│   │   │   ├── product.constants.js
│   │   │   ├── product.mapper.js
│   │   │   └── product.policy.js
│   │   │
│   │   ├── categories/
│   │   │   ├── category.model.js
│   │   │   ├── category.controller.js
│   │   │   ├── category.service.js
│   │   │   ├── category.repository.js
│   │   │   ├── category.validation.js
│   │   │   ├── category.routes.js
│   │   │   └── category.mapper.js
│   │   │
│   │   ├── enquiries/
│   │   │   ├── enquiry.model.js
│   │   │   ├── enquiry.controller.js
│   │   │   ├── enquiry.service.js
│   │   │   ├── enquiry.repository.js
│   │   │   ├── enquiry.validation.js
│   │   │   ├── enquiry.routes.js
│   │   │   ├── enquiry.constants.js
│   │   │   └── enquiry.mapper.js
│   │   │
│   │   ├── customers/
│   │   │   ├── customer.model.js
│   │   │   ├── customer.controller.js
│   │   │   ├── customer.service.js
│   │   │   ├── customer.repository.js
│   │   │   ├── customer.validation.js
│   │   │   ├── customer.routes.js
│   │   │   └── customer.mapper.js
│   │   │
│   │   ├── suppliers/
│   │   │   ├── supplier.model.js
│   │   │   ├── supplier.controller.js
│   │   │   ├── supplier.service.js
│   │   │   ├── supplier.repository.js
│   │   │   ├── supplier.validation.js
│   │   │   ├── supplier.routes.js
│   │   │   └── supplier.mapper.js
│   │   │
│   │   ├── inventory/
│   │   │   ├── inventory.model.js
│   │   │   ├── stockMovement.model.js
│   │   │   ├── inventory.controller.js
│   │   │   ├── inventory.service.js
│   │   │   ├── inventory.repository.js
│   │   │   ├── stockMovement.repository.js
│   │   │   ├── inventory.validation.js
│   │   │   ├── inventory.routes.js
│   │   │   ├── inventory.constants.js
│   │   │   └── inventory.mapper.js
│   │   │
│   │   ├── purchases/
│   │   │   ├── purchase.model.js
│   │   │   ├── purchase.controller.js
│   │   │   ├── purchase.service.js
│   │   │   ├── purchase.repository.js
│   │   │   ├── purchase.validation.js
│   │   │   ├── purchase.routes.js
│   │   │   ├── purchase.constants.js
│   │   │   └── purchase.mapper.js
│   │   │
│   │   ├── billing/
│   │   │   ├── invoice.model.js
│   │   │   ├── payment.model.js
│   │   │   ├── billing.controller.js
│   │   │   ├── billing.service.js
│   │   │   ├── invoice.repository.js
│   │   │   ├── payment.repository.js
│   │   │   ├── billing.validation.js
│   │   │   ├── billing.routes.js
│   │   │   ├── billing.constants.js
│   │   │   ├── invoiceNumber.service.js
│   │   │   ├── tax.service.js
│   │   │   ├── invoicePdf.service.js
│   │   │   └── invoice.mapper.js
│   │   │
│   │   ├── employees/
│   │   │   ├── employee.model.js
│   │   │   ├── employee.controller.js
│   │   │   ├── employee.service.js
│   │   │   ├── employee.repository.js
│   │   │   ├── employee.validation.js
│   │   │   ├── employee.routes.js
│   │   │   ├── employee.constants.js
│   │   │   ├── employee.mapper.js
│   │   │   └── employee.policy.js
│   │   │
│   │   ├── attendance/
│   │   │   ├── attendance.model.js
│   │   │   ├── attendance.controller.js
│   │   │   ├── attendance.service.js
│   │   │   ├── attendance.repository.js
│   │   │   ├── attendance.validation.js
│   │   │   ├── attendance.routes.js
│   │   │   ├── attendance.constants.js
│   │   │   ├── attendance.mapper.js
│   │   │   └── attendance.policy.js
│   │   │
│   │   ├── leave/
│   │   │   ├── leave.model.js
│   │   │   ├── leave.controller.js
│   │   │   ├── leave.service.js
│   │   │   ├── leave.repository.js
│   │   │   ├── leave.validation.js
│   │   │   ├── leave.routes.js
│   │   │   ├── leave.constants.js
│   │   │   ├── leave.mapper.js
│   │   │   └── leave.policy.js
│   │   │
│   │   ├── payroll/
│   │   │   ├── salaryStructure.model.js
│   │   │   ├── payroll.model.js
│   │   │   ├── payroll.controller.js
│   │   │   ├── payroll.service.js
│   │   │   ├── salaryStructure.repository.js
│   │   │   ├── payroll.repository.js
│   │   │   ├── payroll.validation.js
│   │   │   ├── payroll.routes.js
│   │   │   ├── payroll.constants.js
│   │   │   ├── payroll.mapper.js
│   │   │   └── payroll.policy.js
│   │   │
│   │   ├── dashboard/
│   │   │   ├── dashboard.controller.js
│   │   │   ├── dashboard.service.js
│   │   │   ├── dashboard.repository.js
│   │   │   ├── dashboard.routes.js
│   │   │   └── dashboard.policy.js
│   │   │
│   │   ├── reports/
│   │   │   ├── report.controller.js
│   │   │   ├── report.service.js
│   │   │   ├── report.repository.js
│   │   │   ├── report.validation.js
│   │   │   ├── report.routes.js
│   │   │   └── report.policy.js
│   │   │
│   │   ├── notifications/
│   │   │   ├── notification.model.js
│   │   │   ├── notification.controller.js
│   │   │   ├── notification.service.js
│   │   │   ├── notification.repository.js
│   │   │   ├── notification.validation.js
│   │   │   ├── notification.routes.js
│   │   │   ├── notification.constants.js
│   │   │   └── notification.mapper.js
│   │   │
│   │   ├── content/
│   │   │   ├── websiteContent.model.js
│   │   │   ├── banner.model.js
│   │   │   ├── testimonial.model.js
│   │   │   ├── content.controller.js
│   │   │   ├── content.service.js
│   │   │   ├── content.repository.js
│   │   │   ├── content.validation.js
│   │   │   ├── content.routes.js
│   │   │   └── content.mapper.js
│   │   │
│   │   ├── settings/
│   │   │   ├── setting.model.js
│   │   │   ├── setting.controller.js
│   │   │   ├── setting.service.js
│   │   │   ├── setting.repository.js
│   │   │   ├── setting.validation.js
│   │   │   ├── setting.routes.js
│   │   │   └── setting.mapper.js
│   │   │
│   │   └── audit/
│   │       ├── auditLog.model.js
│   │       ├── audit.controller.js
│   │       ├── audit.service.js
│   │       ├── audit.repository.js
│   │       ├── audit.routes.js
│   │       └── audit.mapper.js
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
│   │   │
│   │   ├── errors/
│   │   │   ├── AppError.js
│   │   │   ├── BadRequestError.js
│   │   │   ├── UnauthorizedError.js
│   │   │   ├── ForbiddenError.js
│   │   │   ├── NotFoundError.js
│   │   │   └── ConflictError.js
│   │   │
│   │   ├── responses/
│   │   │   ├── apiResponse.js
│   │   │   └── paginationResponse.js
│   │   │
│   │   ├── validators/
│   │   │   ├── common.validation.js
│   │   │   └── mongoId.validation.js
│   │   │
│   │   ├── constants/
│   │   │   ├── http.constants.js
│   │   │   ├── pagination.constants.js
│   │   │   └── common.constants.js
│   │   │
│   │   └── helpers/
│   │       ├── permission.helper.js
│   │       ├── ownership.helper.js
│   │       └── transaction.helper.js
│   │
│   ├── services/
│   │   ├── email.service.js
│   │   ├── sms.service.js
│   │   ├── whatsapp.service.js
│   │   ├── fileStorage.service.js
│   │   ├── pdf.service.js
│   │   ├── export.service.js
│   │   └── token.service.js
│   │
│   ├── utils/
│   │   ├── asyncHandler.js
│   │   ├── pagination.js
│   │   ├── queryBuilder.js
│   │   ├── apiFeatures.js
│   │   ├── slugify.js
│   │   ├── generateId.js
│   │   ├── date.utils.js
│   │   ├── currency.utils.js
│   │   ├── number.utils.js
│   │   ├── sanitize.utils.js
│   │   └── object.utils.js
│   │
│   ├── templates/
│   │   ├── emails/
│   │   │   ├── welcome.template.js
│   │   │   ├── passwordReset.template.js
│   │   │   ├── enquiryReceived.template.js
│   │   │   └── invoice.template.js
│   │   │
│   │   └── pdf/
│   │       ├── invoice.template.js
│   │       ├── payslip.template.js
│   │       └── report.template.js
│   │
│   └── docs/
│       ├── api.md
│       ├── modules.md
│       ├── permissions.md
│       ├── roles.md
│       └── database.md
│
├── storage/
│   ├── uploads/
│   │   ├── products/
│   │   ├── employees/
│   │   ├── invoices/
│   │   └── documents/
│   │
│   └── exports/
│
├── logs/
│   ├── application.log
│   └── error.log
│
├── .env.example
├── .gitignore
├── eslint.config.js
├── package.json
└── package-lock.json
```

---

# 5. Why This Hybrid Architecture Is Better

The frontend and backend solve different organizational problems.

## Frontend Problem

Frontend code changes mainly based on:

```text
Who is using the screen?
```

For example:

```text
Admin Attendance
```

needs:

```text
all employees
manual correction
filters
reports
management actions
```

while:

```text
Employee Attendance
```

needs:

```text
my attendance
check-in
check-out
history
```

So frontend role segregation makes sense.

---

## Backend Problem

Backend logic changes mainly based on:

```text
What business operation is being executed?
```

For example, there should be only one:

```text
attendance.service.js
```

and not:

```text
adminAttendance.service.js
employeeAttendance.service.js
superAdminAttendance.service.js
```

unless they contain truly different business logic.

That is why backend remains feature-oriented.

---

# 6. Backend Feature Module Standard

Every substantial backend feature should follow:

```text
modules/
└── products/
    ├── product.model.js
    ├── product.controller.js
    ├── product.service.js
    ├── product.repository.js
    ├── product.validation.js
    ├── product.routes.js
    ├── product.constants.js
    ├── product.mapper.js
    └── product.policy.js
```

---

# 7. Responsibility of Each Backend File

## `*.model.js`

Mongoose entity definition.

Responsible for:

```text
fields
types
indexes
references
schema constraints
timestamps
small schema methods
```

---

## `*.repository.js`

Database access only.

Examples:

```js
findById()
findOne()
findMany()
create()
update()
delete()
exists()
aggregate()
```

---

## `*.service.js`

Core business logic.

Examples:

```text
create invoice
calculate payroll
approve leave
adjust inventory
process purchase
update stock
generate invoice number
calculate tax
```

---

## `*.controller.js`

HTTP layer.

Responsibilities:

```text
read req
call service
return response
```

Avoid heavy business logic.

---

## `*.validation.js`

Request validation.

Includes:

```text
body
params
query
```

---

## `*.routes.js`

Endpoint registration.

Example:

```js
router.get("/", controller.list);
router.post("/", controller.create);
```

Authorization middleware is attached here.

---

## `*.mapper.js`

Maps database records to API response shape.

Used for:

```text
remove internal fields
format nested data
hide sensitive fields
normalize responses
```

---

## `*.policy.js`

Feature-level authorization logic.

Example:

```js
canReadProduct()
canUpdateProduct()
canViewOwnPayroll()
canManageAttendance()
```

This prevents controller files from becoming full of role conditions.

---

# 8. Recommended Backend Access Strategy

Backend stays feature-oriented, but route access is controlled through:

```text
authentication
+
role
+
permission
+
ownership
```

Example:

```js
router.get(
  "/",
  authenticate,
  requirePermission("products.read"),
  productController.list
);
```

Admin management:

```js
router.post(
  "/",
  authenticate,
  requirePermission("products.create"),
  validate(productValidation.create),
  productController.create
);
```

Public products:

```js
router.get(
  "/public",
  productController.listPublic
);
```

Employee own payroll:

```js
router.get(
  "/me",
  authenticate,
  requireRole("EMPLOYEE"),
  payrollController.getMyPayroll
);
```

---

# 9. Recommended Backend API Structure

Use one API namespace:

```text
/api/v1
```

The backend remains feature-based.

Recommended:

```text
/api/v1/auth

/api/v1/users
/api/v1/roles

/api/v1/products
/api/v1/categories

/api/v1/enquiries
/api/v1/customers
/api/v1/suppliers

/api/v1/inventory
/api/v1/purchases

/api/v1/billing
/api/v1/invoices
/api/v1/payments

/api/v1/employees
/api/v1/attendance
/api/v1/leaves
/api/v1/payroll

/api/v1/dashboard
/api/v1/reports

/api/v1/notifications
/api/v1/content
/api/v1/settings
/api/v1/audit
```

---

# 10. Public Endpoints

Public endpoints can live inside feature modules.

Examples:

```text
GET  /api/v1/products/public
GET  /api/v1/products/public/:slug

GET  /api/v1/categories/public

POST /api/v1/enquiries/public
GET  /api/v1/content/public
```

Alternative clean public alias routes can be added:

```text
/api/v1/public/products
/api/v1/public/categories
/api/v1/public/content
```

but internally they should still call:

```text
products service
categories service
content service
```

rather than create duplicate modules.

---

# 11. Frontend URL Structure

## Public

```text
/
 /about
 /products
 /products/:slug
 /categories
 /contact
 /enquiry
```

---

## Super Admin

```text
/super-admin
/super-admin/dashboard
/super-admin/admins
/super-admin/roles
/super-admin/permissions
/super-admin/reports
/super-admin/settings
/super-admin/audit-logs
/super-admin/system
```

---

## Admin

```text
/admin
/admin/dashboard

/admin/products
/admin/categories

/admin/enquiries
/admin/customers
/admin/suppliers

/admin/inventory
/admin/purchases

/admin/invoices
/admin/billing

/admin/employees
/admin/attendance
/admin/leave
/admin/payroll

/admin/reports
/admin/content
```

---

## Employee

```text
/employee
/employee/dashboard
/employee/profile
/employee/attendance
/employee/leave
/employee/payroll
/employee/notifications
```

---

# 12. Frontend-to-Backend Mapping

Role-based frontend does NOT require role-based backend.

Example:

```text
frontend/modules/admin/products/
        ↓
backend/modules/products/
```

Public products:

```text
frontend/modules/public/products/
        ↓
backend/modules/products/
```

Both use the same backend feature.

---

## Another Example

```text
frontend/modules/admin/attendance/
        ↓
backend/modules/attendance/
```

and:

```text
frontend/modules/employee/attendance/
        ↓
backend/modules/attendance/
```

Backend decides behavior based on:

```text
user
role
permission
ownership
```

---

# 13. Product Flow

Public:

```text
Public Products Page
      ↓
publicProducts.api.js
      ↓
GET /api/v1/products/public
      ↓
product.controller
      ↓
product.service
      ↓
product.repository
      ↓
product.model
```

Admin:

```text
Admin Products Page
      ↓
products.api.js
      ↓
POST /api/v1/products
      ↓
auth
      ↓
permission(products.create)
      ↓
product.controller
      ↓
product.service
      ↓
product.repository
      ↓
product.model
```

Same backend module.

---

# 14. Attendance Flow

Admin:

```text
Admin Attendance Page
      ↓
GET /api/v1/attendance
      ↓
attendance.controller
      ↓
attendance.service
      ↓
attendance.repository
```

Employee:

```text
Employee Attendance Page
      ↓
GET /api/v1/attendance/me
      ↓
authenticate
      ↓
attendance.controller
      ↓
attendance.service
      ↓
attendance.repository
```

Employee ID should come from:

```js
req.user.employeeId
```

not from client input.

---

# 15. Payroll Flow

Admin:

```text
POST /api/v1/payroll/generate
```

Employee:

```text
GET /api/v1/payroll/me
```

Both go through:

```text
payroll/
├── payroll.controller.js
├── payroll.service.js
├── payroll.repository.js
└── payroll.model.js
```

No duplicate payroll logic.

---

# 16. Role Hierarchy

```text
SUPER_ADMIN
│
├── system control
├── admin accounts
├── roles
├── permissions
├── settings
├── audit logs
└── global reports

ADMIN
│
├── products
├── categories
├── inventory
├── purchases
├── billing
├── customers
├── suppliers
├── employees
├── attendance
├── leave
├── payroll
├── reports
└── website content

EMPLOYEE
│
├── own profile
├── own attendance
├── own leave
├── own payroll
└── notifications

PUBLIC
│
├── website
├── products
├── categories
├── contact
└── enquiries
```

---

# 17. Permission Strategy

Do not rely only on:

```js
if (role === "ADMIN")
```

Use granular permissions.

Example:

```text
products.read
products.create
products.update
products.delete

inventory.read
inventory.adjust

billing.read
billing.create
billing.update
billing.cancel

customers.read
customers.create
customers.update

employees.read
employees.create
employees.update

attendance.read
attendance.manage

leave.read
leave.create
leave.approve

payroll.read
payroll.manage

reports.read

users.manage
roles.manage
settings.manage
audit.read
```

---

# 18. Employee-Specific Permissions

```text
employee.profile.read
employee.profile.update

employee.attendance.read
employee.attendance.checkin
employee.attendance.checkout

employee.leave.read
employee.leave.create

employee.payroll.read

employee.notifications.read
```

---

# 19. Backend Policy Layer

A policy file is useful when authorization requires feature knowledge.

Example:

```text
payroll.policy.js
```

Conceptual logic:

```js
export function canViewPayroll(user, payroll) {
  if (user.role === "SUPER_ADMIN") return true;

  if (user.permissions.includes("payroll.manage")) return true;

  return payroll.employeeId.toString() === user.employeeId.toString();
}
```

This keeps authorization rules near the feature.

---

# 20. Mongoose Collections

Recommended MongoDB collections:

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

# 21. Entity Relationships

```text
Category
   │
   └──< Product
          │
          ├── Inventory
          ├── StockMovement
          ├── PurchaseItem
          └── InvoiceItem


Supplier
   │
   └──< Purchase
          │
          └──< PurchaseItem


Customer
   │
   └──< Invoice
          │
          ├──< InvoiceItem
          └──< Payment


Employee
   │
   ├──< Attendance
   ├──< Leave
   ├── SalaryStructure
   └──< Payroll


User
   │
   └── Role
        │
        └── Permissions


User
   │
   └──< AuditLog
```

---

# 22. Inventory Architecture

Inventory should keep both:

```text
current stock
+
stock movement history
```

Models:

```text
inventory.model.js
stockMovement.model.js
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

# 23. Inventory Sale Flow

```text
Invoice Created
      ↓
billing.service
      ↓
inventory.service
      ↓
decrease current quantity
      ↓
stockMovement.repository
      ↓
create SALE movement
```

---

# 24. Purchase Flow

```text
Admin creates purchase
      ↓
purchase.service
      ↓
validate supplier/items
      ↓
inventory.service
      ↓
increase stock
      ↓
create PURCHASE movement
```

---

# 25. Billing Architecture

Recommended:

```text
modules/billing/
├── invoice.model.js
├── payment.model.js
├── billing.controller.js
├── billing.service.js
├── invoice.repository.js
├── payment.repository.js
├── billing.validation.js
├── billing.routes.js
├── billing.constants.js
├── invoiceNumber.service.js
├── tax.service.js
├── invoicePdf.service.js
└── invoice.mapper.js
```

---

# 26. Invoice Data

Recommended invoice fields:

```text
invoiceNumber
invoiceDate

customer

items[]

subtotal
discount
taxableAmount
taxAmount
grandTotal

paidAmount
balanceAmount

paymentStatus
invoiceStatus

notes
createdBy

createdAt
updatedAt
```

---

# 27. Employee Architecture

Employee core profile:

```text
modules/employees/
```

Attendance:

```text
modules/attendance/
```

Leave:

```text
modules/leave/
```

Payroll:

```text
modules/payroll/
```

Do not create one huge employee module containing all HR logic.

---

# 28. Employee Attendance Data

```text
employee
date

checkIn
checkOut

workingHours
status

remarks

createdBy
updatedBy
```

---

# 29. Leave Data

```text
employee

leaveType

fromDate
toDate
days

reason

status

approvedBy
approvedAt

rejectionReason
```

---

# 30. Payroll Data

```text
employee
month
year

baseSalary

allowances[]
deductions[]

attendanceAdjustment

grossSalary
netSalary

paymentStatus

generatedBy
generatedAt
```

---

# 31. Dashboard Backend

Because backend is feature-oriented, one dashboard module can return data based on access.

```text
modules/dashboard/
├── dashboard.controller.js
├── dashboard.service.js
├── dashboard.repository.js
├── dashboard.routes.js
└── dashboard.policy.js
```

Possible routes:

```text
GET /api/v1/dashboard/super-admin
GET /api/v1/dashboard/admin
GET /api/v1/dashboard/employee
```

All live inside the same dashboard feature.

---

# 32. Reports Backend

One feature:

```text
modules/reports/
```

Routes:

```text
GET /api/v1/reports/sales
GET /api/v1/reports/inventory
GET /api/v1/reports/purchases
GET /api/v1/reports/billing
GET /api/v1/reports/employees
GET /api/v1/reports/attendance
GET /api/v1/reports/payroll
```

Permissions determine who can see what.

---

# 33. Authentication Model

Recommended User:

```text
User
├── name
├── email
├── phone
├── passwordHash
├── role
├── employeeId
├── permissionsOverride[]
├── status
├── lastLogin
├── refreshTokens
├── createdAt
└── updatedAt
```

---

# 34. Role Model

```text
Role
├── name
├── code
├── description
├── permissions[]
├── isSystemRole
└── status
```

Examples:

```text
SUPER_ADMIN
ADMIN
EMPLOYEE
```

---

# 35. Ownership Security

Some backend endpoints need ownership restrictions.

Example:

```text
GET /api/v1/payroll/me
```

Backend resolves:

```js
const employeeId = req.user.employeeId;
```

Do not use:

```text
GET /api/v1/payroll/:employeeId
```

for employee self-service.

Otherwise a user could try another employee ID.

Apply same rule to:

```text
profile
attendance
leave
payroll
notifications
```

---

# 36. Backend Request Flow

```text
Client
  ↓
Route
  ↓
Authentication
  ↓
Role Check
  ↓
Permission Check
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
Mongoose Model
  ↓
MongoDB
```

---

# 37. Frontend Request Flow

```text
Role Page
   ↓
Role Feature Component
   ↓
Role API File
   ↓
Shared Axios Client
   ↓
Backend Feature Endpoint
```

Example:

```text
frontend/modules/admin/products/pages/ProductsPage.jsx
       ↓
frontend/modules/admin/products/api/products.api.js
       ↓
GET /api/v1/products
       ↓
backend/modules/products/product.routes.js
```

---

# 38. Shared Frontend Rule

Role-specific UI:

```text
modules/<role>/
```

Generic UI:

```text
shared/components/
```

Examples of shared:

```text
Button
Input
Modal
Table
Pagination
Loader
SearchBox
FileUploader
```

Do not duplicate these under every role.

---

# 39. Shared Backend Rule

Feature-specific business logic stays inside:

```text
modules/<feature>/
```

Cross-feature technical capabilities stay inside:

```text
services/
```

Examples:

```text
email
SMS
WhatsApp
PDF
storage
exports
tokens
```

Generic technical utilities stay inside:

```text
utils/
shared/
```

---

# 40. Cross-Feature Service Calls

Feature modules may call another feature service when the business workflow requires it.

Example:

```text
billing.service.js
      ↓
inventory.service.js
```

when invoice confirmation decreases stock.

Purchase:

```text
purchase.service.js
      ↓
inventory.service.js
```

when received stock increases inventory.

Payroll:

```text
payroll.service.js
      ↓
attendance.service.js
```

for attendance-based adjustments.

Avoid calling another feature's controller.

Correct:

```text
service → service
```

Wrong:

```text
service → controller
```

---

# 41. Dependency Direction

Recommended:

```text
routes
  ↓
controller
  ↓
service
  ↓
repository
  ↓
model
```

Cross-feature:

```text
service
  ↓
otherFeature.service
```

Never:

```text
model
  ↓
controller
```

and never:

```text
repository
  ↓
controller
```

---

# 42. Standard API Response

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

---

# 43. Audit Logging

Audit model:

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

Recommended actions:

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
INVOICE_UPDATE
INVOICE_CANCEL

PAYMENT_ADD

EMPLOYEE_CREATE
EMPLOYEE_UPDATE

ATTENDANCE_UPDATE

LEAVE_APPROVE
LEAVE_REJECT

PAYROLL_GENERATE

SETTINGS_UPDATE
```

---

# 44. Backend Security Layers

Recommended:

```text
Helmet

CORS

Rate Limiting

MongoDB Sanitization

Request Validation

Password Hashing

JWT Access Tokens

Refresh Tokens

RBAC

Granular Permissions

Ownership Validation

Audit Logs

Centralized Error Handling

Upload Validation

Request IDs

Request Logging
```

---

# 45. Frontend Environment

```env
VITE_APP_NAME=KN Agro
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_PUBLIC_SITE_URL=http://localhost:5173
```

---

# 46. Backend Environment

```env
NODE_ENV=development
PORT=5000

MONGODB_URI=

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

JWT_ACCESS_EXPIRES_IN=
JWT_REFRESH_EXPIRES_IN=

FRONTEND_URL=http://localhost:5173

EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASSWORD=

FILE_STORAGE_PROVIDER=
```

Never commit actual `.env`.

---

# 47. Frontend Naming Convention

Components:

```text
PascalCase.jsx
```

Examples:

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
```

---

# 48. Backend Naming Convention

Examples:

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

Functions:

```text
camelCase
```

Classes:

```text
PascalCase
```

Constants:

```text
UPPER_SNAKE_CASE
```

MongoDB collections:

```text
lowercase plural
```

---

# 49. Recommended Backend Module Boundaries

```text
AUTH
├── login
├── logout
├── refresh
└── password recovery

USERS
├── admin accounts
├── staff accounts
└── status management

ROLES
├── roles
└── permissions

PRODUCTS
├── product catalogue
├── public visibility
└── product management

CATEGORIES
└── product categorization

ENQUIRIES
├── public submission
└── admin management

CUSTOMERS
└── customer CRM

SUPPLIERS
└── supplier records

INVENTORY
├── current stock
├── movements
└── adjustments

PURCHASES
├── purchase entry
└── stock receipt

BILLING
├── invoices
├── payments
├── tax
└── invoice PDF

EMPLOYEES
└── employee master records

ATTENDANCE
├── check-in/out
└── attendance management

LEAVE
├── applications
└── approvals

PAYROLL
├── salary structures
├── monthly payroll
└── payslips

DASHBOARD
└── role-aware dashboard aggregations

REPORTS
└── business reports

CONTENT
└── website content

NOTIFICATIONS
└── system/user notifications

SETTINGS
└── global configuration

AUDIT
└── activity history
```

---

# 50. Recommended Frontend Role Boundaries

```text
SUPER ADMIN
├── system dashboard
├── admins
├── roles
├── permissions
├── reports
├── audit
└── settings

ADMIN
├── operations dashboard
├── products
├── categories
├── enquiries
├── customers
├── suppliers
├── inventory
├── purchases
├── billing
├── employees
├── attendance
├── leave
├── payroll
├── reports
└── content

EMPLOYEE
├── personal dashboard
├── profile
├── attendance
├── leave
├── payroll
└── notifications

PUBLIC
├── home
├── products
├── categories
├── about
├── contact
└── enquiry
```

---

# 51. Final Architecture Visualization

```text
┌───────────────────────────────────────────────────────────┐
│                    REACT FRONTEND                         │
│                                                           │
│  ROLE BASED                                               │
│                                                           │
│  ┌─────────────┐ ┌─────────┐ ┌────────┐ ┌─────────────┐  │
│  │ Super Admin │ │  Admin  │ │ Public │ │  Employee   │  │
│  └─────────────┘ └─────────┘ └────────┘ └─────────────┘  │
│                                                           │
│                  Shared Components                        │
│                  Shared API Client                        │
│                  Shared Hooks                             │
└────────────────────────────┬──────────────────────────────┘
                             │
                             │ REST API
                             ▼
┌───────────────────────────────────────────────────────────┐
│                  NODE + EXPRESS BACKEND                   │
│                                                           │
│  FEATURE ORIENTED                                         │
│                                                           │
│ Auth        Products       Inventory       Employees       │
│ Users       Categories     Purchases       Attendance      │
│ Roles       Enquiries      Billing         Leave           │
│ Customers   Suppliers      Payments        Payroll         │
│ Dashboard   Reports        Content         Settings        │
│ Notifications              Audit                           │
│                                                           │
│  Auth + Role + Permission + Ownership + Policies           │
└────────────────────────────┬──────────────────────────────┘
                             │
                             ▼
┌───────────────────────────────────────────────────────────┐
│                         MONGODB                           │
│                                                           │
│ One Collection / Entity Source of Truth                   │
└───────────────────────────────────────────────────────────┘
```

---

# 52. Key Rule of This Architecture

The most important distinction is:

```text
FRONTEND
= WHO is using the application?

BACKEND
= WHAT business capability is being executed?
```

Example:

```text
Admin Product UI
        │
        ├─────────────┐
        │             │
Public Product UI     │
        │             │
        └──────┬──────┘
               ▼
        Backend Products Module
               │
               ▼
        Product Collection
```

And:

```text
Admin Attendance UI
        │
        ├──────────────┐
        │              │
Employee Attendance UI│
        │              │
        └──────┬───────┘
               ▼
       Attendance Backend Module
               │
               ▼
       Attendance Collection
```

This gives:

```text
clear frontend separation
+
single backend source of truth
+
low duplication
+
strong authorization
+
clean business boundaries
+
easier scaling
```

---

# 53. Final Recommended Root Tree

```text
kn-agro/
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── app/
│       ├── api/
│       ├── routes/
│       ├── layouts/
│       │
│       ├── modules/
│       │   ├── super-admin/
│       │   ├── admin/
│       │   ├── public/
│       │   ├── employee/
│       │   └── auth/
│       │
│       ├── shared/
│       ├── hooks/
│       ├── context/
│       ├── store/
│       ├── constants/
│       ├── config/
│       ├── utils/
│       └── assets/
│
└── backend/
    └── src/
        ├── config/
        ├── database/
        ├── routes/
        │
        ├── modules/
        │   ├── auth/
        │   ├── users/
        │   ├── roles/
        │   ├── products/
        │   ├── categories/
        │   ├── enquiries/
        │   ├── customers/
        │   ├── suppliers/
        │   ├── inventory/
        │   ├── purchases/
        │   ├── billing/
        │   ├── employees/
        │   ├── attendance/
        │   ├── leave/
        │   ├── payroll/
        │   ├── dashboard/
        │   ├── reports/
        │   ├── notifications/
        │   ├── content/
        │   ├── settings/
        │   └── audit/
        │
        ├── middlewares/
        ├── shared/
        ├── services/
        ├── utils/
        ├── templates/
        └── docs/
```

---

# 54. Recommended Implementation Order

```text
PHASE 1
├── root project
├── React setup
├── Express setup
├── MongoDB
├── environment configuration
├── common error handling
└── shared API response

PHASE 2
├── authentication
├── users
├── roles
├── permissions
└── frontend protected role routes

PHASE 3
├── public frontend
├── products backend
├── categories backend
├── content backend
├── enquiries backend
└── admin product/content screens

PHASE 4
├── customers
├── suppliers
├── inventory
└── purchases

PHASE 5
├── billing
├── payments
├── invoice PDF
└── inventory integration

PHASE 6
├── employees
├── employee frontend
├── attendance
├── leave
└── payroll

PHASE 7
├── dashboards
├── reports
├── notifications
├── audit logs
└── settings
```

---

# 55. Final Recommendation

For KN Agro, this architecture is preferable because:

```text
Frontend role separation
```

keeps the very different user experiences isolated, while:

```text
Backend feature modularity
```

prevents duplicated business rules and duplicated MongoDB models.

The architecture should therefore remain:

```text
Frontend
→ Role-Based

Backend
→ Feature-Oriented Modular

Authorization
→ Role + Permission + Ownership + Policy

Database
→ One Source of Truth Per Business Entity
```

This is the recommended final scalable MERN architecture for the project.
