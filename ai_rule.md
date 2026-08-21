# KN Agro AI Rules

These rules guide AI-assisted development for the KN Agro MERN platform. They are based on `about_the_project.md` and must be followed when planning, generating, editing, reviewing, or refactoring code in this repository.

## Source Of Truth

- Project brief: `about_the_project.md`
- File structure reference: `File_structurefmd`
- Detailed rule docs:
  - `docs/ai_rules/architecture-rules.md`
  - `docs/ai_rules/frontend-rules.md`
  - `docs/ai_rules/backend-rules.md`
  - `docs/ai_rules/database-safety.md`
  - `docs/ai_rules/security-rules.md`

## Core Architecture

- Frontend is role-based: `super-admin`, `admin`, `employee`, `public`, and `auth`.
- Backend is feature-oriented: `auth`, `users`, `roles`, `products`, `inventory`, `billing`, `employees`, `attendance`, `dsr`, `leave`, `payroll`, and related modules.
- MongoDB keeps one source of truth per business entity.
- Authorization is layered: authentication, role, permission, ownership, and policy.
- KN Agro is a hybrid modular monolith. Do not split it into microservices unless explicitly requested.

## Golden Rule

Frontend answers: "Who is using this screen?"

Backend answers: "What business capability is being executed?"

Do not create role-specific backend modules such as `admin/products` or `employee/attendance`. Put business logic in feature modules and expose role-appropriate UI on the frontend.

## Required Development Behavior

- Read the relevant project docs before implementing a module.
- Preserve the planned folder boundaries unless there is a strong documented reason.
- Prefer small, complete, working slices over partial scaffolding.
- Keep shared utilities generic and business logic inside feature modules.
- Never bypass backend authorization because the frontend hides a button.
- Validate all input on the backend, including data already validated by the frontend.
- Add or update audit logs for important business actions.
- Keep financial, stock, attendance, DSR, payroll, and permission changes traceable.

## Implementation Priority

Follow the project phases unless the user requests a specific feature:

1. Foundation, React, Express, MongoDB, env, API responses, error handling.
2. Authentication, users, roles, permissions, protected routes.
3. Public website, products, categories, content, enquiries.
4. Customers, suppliers, inventory, purchases.
5. Billing, payments, PDF, inventory integration.
6. Employees, employee portal, attendance, leave.
7. DSR, reminders, review, compliance reports.
8. Payroll.
9. Dashboards, reports, notifications, audit, settings.

## Non-Negotiables

- Never commit real secrets or `.env` values.
- Never trust client-side role or permission checks as security.
- Never update stock without a stock movement record.
- Never confirm invoices or purchases without inventory side effects.
- Never allow employees to access another employee's private data.
- Never allow DSR ownership to be chosen from client input.
- Never delete business-critical records by default; prefer status changes or soft delete.
- Never create duplicate MongoDB sources for the same entity.
- Never call controllers from services or repositories.
- Never put database writes directly in route files.

## Rule Documents

Use the detailed docs for category-specific rules:

- Architecture and module boundaries: `docs/ai_rules/architecture-rules.md`
- React frontend patterns: `docs/ai_rules/frontend-rules.md`
- Express backend patterns: `docs/ai_rules/backend-rules.md`
- MongoDB and data safety: `docs/ai_rules/database-safety.md`
- Authentication, authorization, uploads, and audit: `docs/ai_rules/security-rules.md`
