// Employee.department (backend) has always been a free-text string — no
// Department entity/enum exists anywhere in this codebase. This is a
// curated default list so pickers can offer a searchable dropdown instead
// of an open text field; edit this single file to add/rename departments,
// it's the only place the list is defined.
export const DEPARTMENT_OPTIONS = Object.freeze([
  "Sales",
  "Marketing",
  "Operations",
  "Warehouse & Logistics",
  "Finance & Accounts",
  "Human Resources",
  "Procurement",
  "IT & Systems",
  "Customer Support",
  "Administration",
]);

export const DEPARTMENT_LABELS = Object.freeze(
  Object.fromEntries(DEPARTMENT_OPTIONS.map((department) => [department, department])),
);
