# Frontend Migration Phase 4 — Employee Hierarchy N-Tier UI

**Depends on:** Backend Phases 4, 5 (done). Frontend Phase F02. **Type:** rewrite one component,
extend existing employee pages.

**Core insight this phase relies on:** the backend's Scope Engine already returns each actor's
FULL downline (however many levels deep) from ordinary list endpoints — a manager viewing "their
team" via the normal employee list call gets every descendant, not just direct reports, because
the backend's `ancestorPath`-based filtering does that server-side. This phase is NOT about
re-implementing hierarchy traversal on the frontend for access purposes — it's purely about (a)
rendering an N-level tree visually where the current code assumes exactly 2 levels, and (b)
surfacing the new `region`/`district` fields the backend now returns on every employee record.

---

## Prompt 4.1 — Rewrite the hierarchy tree as recursive, not 2-level

```
Open `src/features/employees/components/EmployeeHierarchyTree.jsx` and
`src/features/employees/services/employeeApi.js#getEmployeeHierarchy`. Confirmed by reading both:
the API call returns `{managers: [], unassignedEmployees: []}` and the component renders exactly
those two flat groups — a hardcoded 2-level assumption.

Check whether the backend's `/employees/hierarchy` endpoint (or equivalent) still returns this
same flat shape, or whether it now returns each employee with their `manager`/`ancestorPath`
already populated (check `BACKEND/backend/src/modules/employees/employee.routes.js` and
`employee.service.js` for whatever function backs this endpoint). Two possible paths depending on
what you find:

- If the endpoint still returns a flat employee list (each with a populated `manager` field): build
  the tree CLIENT-SIDE. Group employees by `manager?._id` (root = employees with `manager: null`),
  then recursively render each node's children by looking up who has THIS node's `_id` as their
  `manager`. Replace the current 2-level render with a recursive `<HierarchyNode employee={...}
  children={...} />` component that keeps nesting as long as a node has children, with indentation/
  connector lines scaling with depth (cap visual indentation growth reasonably past ~4-5 levels so
  deep chains don't overflow horizontally — collapse/expand per node if it gets visually busy).
- If the backend already added a proper nested/tree-shaped response for this endpoint as part of
  its own migration work: use that directly instead of re-deriving it client-side, and simplify
  this prompt's work to just rendering whatever shape it returns.

Either way: don't assume depth is bounded at 2. Test with a chain at least 4 levels deep (GM->RM->
ASM->SO->FO) before considering this done.
```

**Acceptance criteria:** a GM->RM->ASM->SO->FO chain renders as a correctly nested 5-level tree, not
truncated or flattened at 2 levels; a node with zero children renders as a leaf without an empty
"children" section.

---

## Prompt 4.2 — Surface region/district on employee list/detail/edit

```
The backend's Employee model now has `region`/`district` (Phase 4) alongside `manager`. Confirmed
by reading `employee.serializer.js`: these fields are already included in the API response.

Add: a Region/District column (or a combined "Location" column) to
`SuperAdminEmployeeListPage`'s/its Sales-Manager-tree equivalent's table; a Region/District display
section on `SuperAdminEmployeeDetailPage`; Region/District select fields on
`SuperAdminEmployeeCreatePage`/`SuperAdminEmployeeEditPage`, sourced from Phase F03's new
`useRegionList`/`useDistrictList` hooks (district options filtered to the selected region, if the
backend models a Region->District parent relationship — confirm by checking `district.model.js`
for a `region` ref field).

Do not add a region/district filter to the employee list yet unless the backend's list endpoint
already supports filtering by them (check `employee.routes.js`'s query schema) — if it doesn't,
note that as a gap rather than building a filter UI for a query param the backend will silently
ignore.
```

**Acceptance criteria:** region/district are visible and editable everywhere an employee's other
core fields already are; the district picker only offers districts consistent with the selected
region if the backend models that relationship.

---

## Stop and report

After Prompt 4.2, report whether the hierarchy endpoint needed client-side tree-building or already
returned a nested shape, and whether the employee list endpoint supports region/district filtering
(flag as a backend gap if not — don't build a UI for a filter the API can't honor).

## Phase F04 exit criteria

- The hierarchy view correctly renders any depth of chain, not just 2 levels.
- Region/district are visible and editable on every employee screen that already shows other core
  fields.

---

## IMPLEMENTED AND VERIFIED

### Prompt 4.1 — the hierarchy endpoint could not be used at all

Neither of the prompt's two anticipated paths applied. `EmployeeService.getHierarchy()` doesn't just
lack nesting — it is **actively wrong for the 7-role hierarchy**: it classifies managers with
`employee.user?.role?.name === ROLES.SALES_MANAGER` and returns
`{managers: [{manager, employees}], unassignedEmployees}`. Under the new roles, no GM/RM/ASM/SO
matches that test, so `managerIds` comes back empty and **every employee in a GM→RM→ASM→SO→FO chain
lands in `unassignedEmployees`**. Its `serializeHierarchyEmployee` also deliberately omits `manager`,
so the payload can't even be re-nested client-side.

So the tree is now built from the **ordinary employee list** instead, which is the right source
anyway: it's scope-filtered server-side (a manager gets their full downline), and its serializer
does include `manager`. `EmployeeHierarchyTree` was rewritten to take a flat `employees` array and
render recursively — a node keeps nesting while it has children, leaves render without an empty
children block, indentation stops growing past depth 4 so long chains can't overflow horizontally,
and each parent is collapsible and shows both its direct-report and total-descendant counts.

One subtlety worth keeping: **roots are "no manager *or* a manager not present in this list"**.
Because the list is scope-filtered, an RM viewing their own team sees themselves with a `manager`
(their GM) who isn't in the response — without that second condition those employees would silently
vanish from the tree.

`/employees/hierarchy` and its `useEmployeeHierarchy` hook were left untouched (still used by
nothing else now) — **flagging the endpoint as a backend gap** rather than editing backend code
mid-phase.

### Prompt 4.2 — region/district are display-only here, by API constraint

Checked before building, and the prompt's own "don't build UI the API can't honor" rule turned out
to apply more widely than it anticipated:

- **`createEmployeeSchema` / `updateEmployeeSchema` do not accept `region` or `district` at all**
  (create takes name/email/temporaryPassword/phone/department/designation/manager/dateOfJoining/
  employmentType/address/emergencyContact; update is explicitly "business-profile fields only").
  Zod strips unknown keys, so region/district selects on the create/edit forms would have been
  silently discarded on save. **They were deliberately not added.**
- The only endpoint that accepts them is `POST /employees/:id/transfer`
  (`toManager`/`toRegion`/`toDistrict` + a required `reason`) — i.e. changing an employee's
  geography is a *transfer*, with its own audit trail, not a casual profile edit. That is
  **Phase F05's** job, and this is where region/district become editable.
- **The employee list endpoint has no region/district filter** (`listEmployeesSchema` allows
  page/limit/search/employeeStatus/department/designation/manager/employmentType/sortBy/sortOrder
  only) — no filter UI was built. **Second backend gap flagged.**

What was added: a **Location column** on the employee table and **Region/District rows** in the
detail page's Manager/Hierarchy section. Both resolve ids to names client-side via a new
`useEmployeeLocations` hook, because the employee serializer deliberately returns `region`/`district`
as raw ObjectIds. District options in that hook are filtered by their parent region
(`districtsForRegion`) — ready for F05's transfer form, since `district.model.js` does carry a
`region` ref.

### Refactor

`useAllEmployees` (pages through the 100-row-capped list endpoint) was extracted into
`features/employees/hooks` and now backs both the hierarchy tree and F03's
`useAssignmentCandidates`, which previously carried its own copy of that paging loop. Cross-feature
imports between `employees` and `districts` go through **specific hook/util files rather than the
feature barrels** — routing them through the barrels made the module graph circular
(employees → districts → employees).

### Verification

Real browser (Playwright/Chromium) against the live dev backend, using a purpose-built 5-level
`GM→RM→ASM→SO→FO` chain (`ancestorPath` depth confirmed at 4 for the FO). **8/8 checks passed,
zero page errors**: the FO renders nested exactly 4 levels deep, all five chain members render,
parent nodes show descendant counts, collapsing the mid-chain ASM hides its SO/FO subtree, the list
has a Location column showing `Region / District`, and the detail page shows both resolved names.
The full-page screenshot also confirmed the existing seeded org (many real multi-level chains) now
renders properly nested where the old 2-level view would have flattened it. All test employees,
users, the test region and district were deleted afterwards; both repos show only intended files.
