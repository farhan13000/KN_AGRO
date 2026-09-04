# Frontend Migration Phase 1 — Role & Permission Constants Sync

**Depends on:** Backend Phase 1 (done). **Type:** extend existing constants, one real bug fix.
**Blocks:** every later phase — every subsequent phase's permission-gated UI assumes these
constants exist and are correct.

---

## Prompt 1.1 — Add the 7 new roles alongside the legacy 3

```
Open `src/shared/constants/roles.constants.js`. It currently defines `ROLE_KEYS` and
`BACKEND_ROLES` for exactly `SUPER_ADMIN, SALES_MANAGER, EMPLOYEE` (mapped to
`super_admin/sales_manager/employee`), plus `ROLE_LABELS` and `normalizeRoleName`.

Add the 7 new roles the same way, keeping the legacy 3 untouched (the backend keeps both models
side by side during migration, per its own Phase 1 — mirror that here):

  ROLE_KEYS: add SA, OA, GM, RM, ASM, SO, FO
  BACKEND_ROLES: SA -> "sa", OA -> "oa", GM -> "gm", RM -> "rm", ASM -> "asm", SO -> "so", FO -> "fo"
    (lowercase values — confirm these match the backend's actual seeded role names exactly by
    checking `BACKEND/backend/src/constants/roles.js` before finalizing; do not guess casing)
  ROLE_LABELS: sensible display labels, e.g. "State Admin"/"Operations Admin"/"General Manager"/
    "Regional Manager"/"Area Sales Manager"/"Sales Officer"/"Field Officer" — confirm the exact
    expansion of each acronym with whoever's driving this migration if it's not obvious from the
    backend docs (`BACKEND/backend/docs/migration-prompts/`) rather than guessing.

Add one new export, `MANAGER_TIER_ROLES` — the frontend mirror of the backend's own
`MANAGER_TIER_ROLES` constant (`BACKEND/backend/src/core/authorization/hierarchy.service.js`):
`[BACKEND_ROLES.SALES_MANAGER, BACKEND_ROLES.GM, BACKEND_ROLES.RM, BACKEND_ROLES.ASM,
BACKEND_ROLES.SO]`. This is the ONE frontend-side duplication of a backend business rule this
migration accepts (a simple "which role names can be assigned as anyone's manager" list, used only
to build a UI picker) — flag it in a comment pointing at the backend file it mirrors, so a future
change to the backend's own list doesn't silently drift. Do not use this constant for any actual
access-control decision, only for populating candidate-manager pickers (Prompt 1.2 fixes the one
place that currently needs it).
```

**Acceptance criteria:** all 7 new roles exist with correct backend-matching values; legacy 3 are
untouched; `MANAGER_TIER_ROLES` exists and is exported.

---

## Prompt 1.2 — Fix the hardcoded manager-eligibility check

```
Open `src/features/employees/components/ManagerAssignmentDialog.jsx`. Line ~37 filters candidate
managers with:

  candidate.user?.role?.name === "sales_manager"

This is exactly the kind of frontend-duplicated business rule the migration is trying to eliminate
— it silently excludes GM/RM/ASM/SO as valid managers. Replace it with a check against Prompt 1.1's
new `MANAGER_TIER_ROLES` constant:

  MANAGER_TIER_ROLES.includes(candidate.user?.role?.name)

Do not change anything else in this file's filtering logic (active-status checks, self-exclusion)
— only the role-name condition.
```

**Acceptance criteria:** the manager-assignment dropdown includes GM/RM/ASM/SO/legacy SALES_MANAGER
candidates, excludes SA/OA/FO/legacy EMPLOYEE/SUPER_ADMIN candidates, and still excludes the
employee being assigned and any inactive candidate.

---

## Prompt 1.3 — Sync permission constants with the backend's actual permission set

```
Open `src/shared/constants/permissions.constants.js` and, side by side,
`BACKEND/backend/src/constants/permissions.js`. The frontend file is missing every permission the
backend added during its own Phases 1-7: `region.*` (create/read/update/delete/assign — check the
backend file for the exact set), `district.*` (same), `employees.transfer`, and the real Promotion
module's permissions: `promotion.read`, `promotion.recommend`, `promotion.approve`,
`promotion.reject`.

Also: `EMPLOYEES_PROMOTE: "employees.promote"` and `EMPLOYEES_PROMOTE_REQUEST:
"employees.promote_request"` currently exist in this file but do NOT correspond to any permission
the backend's seeded roles actually carry (grep `BACKEND/backend/src/seed/seedRoles.js` to confirm
— these look like leftovers from before the Promotion module existed). Do not delete them yet if
anything in this frontend still reads them (grep the whole `src/` tree for both names) — Phase F06
(Promotion Workflow UI) is the one that replaces whatever currently uses them with the real
`PROMOTION_*` permissions and removes these two afterward. For this prompt: add the real
`PROMOTION_*`/`REGION_*`/`DISTRICT_*`/`EMPLOYEES_TRANSFER` constants alongside the existing (stale)
ones — don't remove anything yet.

Leave `HIRING_*`, `SALARY_PROPOSAL_*`, and `DSR_*` for their own phases (F07, F08, F10) — adding
them now, before those backend modules or this frontend's corresponding UI exist, just invites
using a permission string nothing checks yet. Same reasoning for `PRODUCTS_RECOMMEND` (F11) and any
`INVENTORY_TRANSFER`/`INVENTORY_APPROVE` (not yet scheduled in this plan — flag if you find UI that
seems to need it and it isn't covered by a later phase).
```

**Acceptance criteria:** `PERMISSIONS.REGION_*`, `PERMISSIONS.DISTRICT_*`,
`PERMISSIONS.EMPLOYEES_TRANSFER`, `PERMISSIONS.PROMOTION_*` exist with string values that exactly
match the backend's actual seeded permission strings (verified by reading
`BACKEND/backend/src/constants/permissions.js` directly, not inferred from naming convention
alone); nothing pre-existing was removed or renamed.

---

## Stop and report

After Prompt 1.3, stop. Report: the exact role-label wording you chose for the 5 new acronym roles
(flag any you weren't confident about), the grep result for who else reads
`EMPLOYEES_PROMOTE`/`EMPLOYEES_PROMOTE_REQUEST` (so Phase F06 knows exactly what it's replacing),
and confirm every new permission string was verified byte-for-byte against the backend constants
file rather than guessed.

## Phase F01 exit criteria

- All 7 roles and their manager-tier classification exist as frontend constants, matching the
  backend exactly.
- The hardcoded `"sales_manager"` manager-eligibility check is gone.
- New region/district/transfer/promotion permission constants exist and match the backend
  byte-for-byte.

---

## IMPLEMENTED AND VERIFIED

**Role labels chosen** (Prompt 1.1): State Admin (SA), Operations Admin (OA), General Manager (GM),
Regional Manager (RM), Area Sales Manager (ASM), Sales Officer (SO), Field Officer (FO) — confirmed
against the backend's own migration-prompt docs, no ambiguity found. `BACKEND_ROLES` values
(`sa/oa/gm/rm/asm/so/fo`) verified byte-for-byte against `BACKEND/backend/src/constants/roles.js`.
`MANAGER_TIER_ROLES` added to `roles.constants.js` and re-exported from `shared/constants/index.js`
(the barrel file needed its own update — not mentioned explicitly in the original prompt, found by
checking who imports from `shared/constants`).

**`EMPLOYEES_PROMOTE`/`EMPLOYEES_PROMOTE_REQUEST` callers** (Prompt 1.3's grep): exactly two —
`super-admin/pages/employees/SuperAdminEmployeeDetailPage.jsx:165` (the "Promote to Sales Manager"
button's `PermissionGuard`) and `features/employees/utils/lifecycleActions.js:48`. Both left
untouched this phase, as instructed; Phase F06 (Promotion Workflow UI) replaces both with the real
`PROMOTION_*` permissions and removes the old two once the new recommend/approve UI exists.

**New permission constants added:** `REGION_READ/CREATE/UPDATE/MANAGE/ASSIGN`,
`DISTRICT_READ/CREATE/UPDATE/MANAGE/ASSIGN/TRANSFER`, `EMPLOYEES_TRANSFER`,
`PROMOTION_READ/RECOMMEND/APPROVE/REJECT` — every value checked directly against
`BACKEND/backend/src/constants/permissions.js` (not inferred from naming convention).
`HIRING_*`/`SALARY_PROPOSAL_*`/`DSR_*` deliberately deferred to Phases F07/F08/F10 as planned, even
though the backend already seeds those permission strings ahead of its own Hiring/Salary
Proposal/DSR modules being built.

**Verification:**
- `npm run build` — clean, no errors.
- Real end-to-end browser verification (Playwright/Chromium, headless): logged in as the seeded
  Super Admin (`admin@example.com`) against the real dev backend + Atlas cluster, navigated
  Dashboard → Employees → an employee's detail page → opened "Assign Manager". The dropdown
  populated with 11 real `sales_manager`-tier candidates (screenshot confirmed) — identical
  behavior to before the change, since `MANAGER_TIER_ROLES.includes("sales_manager")` is `true`,
  proving the fix is behavior-preserving for the legacy role while now also being ready for
  GM/RM/ASM/SO once those roles have real employees.
- Two `401 POST /api/v1/auth/refresh` console entries were investigated and confirmed to be the
  app's existing pre-login bootstrap silent-refresh attempt (expected on any fresh session with no
  refresh cookie yet) — unrelated to this phase's changes, not a regression.
- `git status` confirms only the four intended files changed
  (`roles.constants.js`, `permissions.constants.js`, `shared/constants/index.js`,
  `ManagerAssignmentDialog.jsx`).
