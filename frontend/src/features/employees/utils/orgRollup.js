/**
 * Rolls per-employee performance up an org tree.
 *
 * WHY SUMMING IS SAFE: the backend attributes every lead, order, invoice
 * and payment to exactly ONE employee — each aggregation groups by
 * `assignedEmployee`, a single id, never a chain. So adding a subtree's
 * rows together counts each record once. If attribution ever became
 * multi-owner (a lead credited to both an FO and their SO, say), these
 * totals would start double-counting and this is the file that would need
 * to change.
 *
 * ONE KNOWN BLIND SPOT, worth stating rather than hiding: those same
 * aggregations only count leads that HAVE an `assignedEmployee`. A lead
 * held by a manager directly — assignedManager set, assignedEmployee
 * null — contributes to nobody's figures, including their own. So a
 * manager's rollup is "what my people booked", not "everything under my
 * name".
 */

/**
 * The metrics carried up the tree. Field names match the backend's own
 * per-employee performance row exactly (assignedLeads, convertedLeads,
 * bookedOrderValue, ...) — read from the live response, not guessed, and
 * ONLY additive quantities appear here. A ratio like conversionRate is
 * deliberately absent: adding percentages is meaningless, so the rate is
 * recomputed from the summed counts wherever it is displayed.
 */
const SUMMABLE = Object.freeze([
  "assignedLeads",
  "convertedLeads",
  "orders",
  "bookedOrderValue",
  "invoicedValue",
  "cashCollected",
  "overdueFollowUps",
  "attendanceRecorded",
  "reportsSubmitted",
]);

const ZERO = Object.freeze(Object.fromEntries(SUMMABLE.map((key) => [key, 0])));

const rowToMetrics = (row) =>
  Object.fromEntries(SUMMABLE.map((key) => [key, Number(row?.[key]) || 0]));

const addMetrics = (a, b) =>
  Object.fromEntries(SUMMABLE.map((key) => [key, (a[key] || 0) + (b[key] || 0)]));

/** Recomputed from the summed counts — never averaged from children. */
export const conversionRateOf = (metrics) =>
  metrics?.assignedLeads ? (metrics.convertedLeads / metrics.assignedLeads) * 100 : 0;

/**
 * Indexes a flat, scope-filtered employee list into manager -> reports.
 *
 * Anyone whose manager is absent from the list is a root: the list is
 * filtered to the viewer's own scope, so a real manager may simply not be
 * in it. Treating those as roots is what stops them being dropped.
 */
export const buildOrgIndex = (employees = []) => {
  const byId = new Map(employees.map((employee) => [String(employee._id), employee]));
  const childrenByManager = new Map();

  for (const employee of employees) {
    const managerId = employee.manager?._id ? String(employee.manager._id) : null;
    if (!managerId || !byId.has(managerId)) continue;
    if (!childrenByManager.has(managerId)) childrenByManager.set(managerId, []);
    childrenByManager.get(managerId).push(employee);
  }

  return { byId, childrenByManager };
};

/**
 * For every employee: their own metrics, the sum for their whole subtree
 * (themselves included), and how many people sit under them.
 *
 * Computed bottom-up in one pass over each root rather than recomputing a
 * subtree per node, so a deep chain costs the same as a shallow one.
 */
export const buildRollups = ({ childrenByManager, employees = [], performanceRows = [] }) => {
  const ownByEmployeeId = new Map(
    performanceRows
      .filter((row) => row?.employee?._id)
      .map((row) => [String(row.employee._id), rowToMetrics(row)]),
  );

  const rollups = new Map();

  const visit = (employee) => {
    const id = String(employee._id);
    if (rollups.has(id)) return rollups.get(id);

    const own = ownByEmployeeId.get(id) || { ...ZERO };
    const kids = childrenByManager.get(id) || [];

    // Regions COVERED by this node: this person's own, plus every region
    // anyone beneath them sits in. A set, not a count — "which ground does
    // this branch cover" is the question, and two people in one region
    // must not read as two regions.
    const regionIds = new Set();
    const ownRegion = employee.region?._id || employee.region;
    if (ownRegion) regionIds.add(String(ownRegion));

    let team = own;
    let headcount = 0;
    for (const kid of kids) {
      const kidRollup = visit(kid);
      team = addMetrics(team, kidRollup.team);
      headcount += 1 + kidRollup.headcount;
      kidRollup.regionIds.forEach((regionId) => regionIds.add(regionId));
    }

    const entry = { own, team, headcount, directReports: kids.length, regionIds };
    rollups.set(id, entry);
    return entry;
  };

  employees.forEach(visit);
  return rollups;
};

export const emptyRollup = () => ({
  own: { ...ZERO },
  team: { ...ZERO },
  headcount: 0,
  directReports: 0,
  regionIds: new Set(),
});
