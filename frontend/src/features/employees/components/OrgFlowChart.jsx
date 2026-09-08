import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactFlow, { Background, Controls, Handle, MarkerType, Position } from "reactflow";
import "reactflow/dist/style.css";
import { ChevronDown, ChevronRight, Crown, MapPin, ShieldCheck, Users } from "lucide-react";
import EmptyState from "../../../shared/components/EmptyState";
import { formatMoney } from "../../../shared/utils";
import { buildOrgIndex, buildRollups, conversionRateOf, emptyRollup } from "../utils/orgRollup";
import { getEmployeeDisplayName } from "../utils";

// Top-to-bottom: depth runs DOWN the page, siblings run across it.
// TIER_GAP must clear the tallest card plus room for the connector to
// bend; SIBLING_GAP must clear the card's width.
const TIER_GAP = 280;
const SIBLING_GAP = 340;

/**
 * One accent per tier, so depth is readable at a glance without counting
 * rows. Deliberately a single ramp of the brand green from senior to
 * junior rather than unrelated hues — the tiers are one ordered chain,
 * and colouring them as a scale says that; colouring them as a rainbow
 * would imply they are unrelated categories.
 */
const ROLE_ACCENT = Object.freeze({
  sa: "#12331F",
  oa: "#1B4D2E",
  gm: "#246B3C",
  rm: "#388750",
  asm: "#4E9A66",
  so: "#7FB894",
  fo: "#A9CEB8",
});

const accentFor = (roleName) => ROLE_ACCENT[roleName] || "#A9CEB8";

const roleOf = (employee) => employee?.user?.role?.name || "";

const compact = (value) => {
  const n = Number(value) || 0;
  if (n >= 10000000) return `${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `${(n / 100000).toFixed(2)}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(Math.round(n));
};

/* ---------------------------------------------------------------- */

function Metric({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-[10px] font-black uppercase tracking-[0.07em] text-muted">{label}</p>
      <p className="mt-0.5 truncate text-[15px] font-black tabular-nums text-ink">{value}</p>
    </div>
  );
}

/**
 * One person in the chart.
 *
 * The figures are the WHOLE SUBTREE's — this person plus everyone under
 * them — because that is what a node means in an org chart: open a GM and
 * you are asking how that GM's organisation is doing, not how many leads
 * the GM personally typed in. The strip above them says whose numbers
 * they are, so the two can never be confused.
 */
function OrgNode({ data }) {
  const { employee, rollup, expanded, hasChildren, onToggle, onOpen, kind, totalsLabel, regionLabel } = data;
  const role = roleOf(employee);
  const name = kind === "sa" ? data.label : getEmployeeDisplayName(employee);
  const accent = kind === "sa" ? ROLE_ACCENT.sa : accentFor(role);
  const showsTeam = rollup.headcount > 0;

  return (
    <div
      className="w-[300px] overflow-hidden rounded-xl border border-forest/15 bg-white shadow-sm transition hover:shadow-md"
      style={{ borderTop: `3px solid ${accent}` }}
    >
      {kind !== "sa" ? <Handle position={Position.Top} type="target" /> : null}

      <div className="flex items-start gap-2 px-4 pb-2 pt-3">
        {hasChildren ? (
          <button
            aria-expanded={expanded}
            aria-label={`${expanded ? "Collapse" : "Expand"} ${name}'s team`}
            className="mt-0.5 shrink-0 rounded-md p-1 text-forest transition hover:bg-mint"
            onClick={(event) => { event.stopPropagation(); onToggle(); }}
            type="button"
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        ) : (
          <span aria-hidden="true" className="mt-0.5 h-6 w-6 shrink-0" />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-black uppercase tracking-[0.08em] text-white"
              style={{ backgroundColor: accent }}
            >
              {kind === "sa" ? <Crown aria-hidden="true" className="h-3 w-3" /> : null}
              {kind === "oa" ? <ShieldCheck aria-hidden="true" className="h-3 w-3" /> : null}
              {kind === "sa" ? "Owner" : role ? role.toUpperCase() : "Staff"}
            </span>
            {employee?.employeeCode ? (
              <span className="truncate text-[11px] font-semibold text-muted">{employee.employeeCode}</span>
            ) : null}
          </div>

          {onOpen ? (
            <button
              className="mt-1.5 block max-w-full truncate text-left text-base font-black text-ink hover:underline"
              onClick={(event) => { event.stopPropagation(); onOpen(); }}
              type="button"
            >
              {name}
            </button>
          ) : (
            <p className="mt-1.5 truncate text-base font-black text-ink">{name}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 pb-3 text-[11px] font-semibold text-muted">
        <span className="inline-flex min-w-0 items-center gap-1">
          <MapPin aria-hidden="true" className="h-3 w-3 shrink-0" />
          <span className="truncate">{regionLabel}</span>
        </span>
        {showsTeam ? (
          <span className="inline-flex items-center gap-1">
            <Users aria-hidden="true" className="h-3 w-3" />
            {rollup.headcount + 1} people
          </span>
        ) : null}
      </div>

      <div className="border-t border-forest/10 bg-mint/25 px-4 py-3">
        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.07em] text-agriculture">
          {totalsLabel || (showsTeam ? "Team total" : "Own figures")}
        </p>
        <div className="grid grid-cols-3 gap-3">
          <Metric label="Leads" value={compact(rollup.team.assignedLeads)} />
          <Metric label="Orders" value={compact(rollup.team.orders)} />
          <Metric label="Sales" value={formatMoney(rollup.team.bookedOrderValue)} />
        </div>
        <p className="mt-2.5 border-t border-forest/10 pt-2 text-[11px] font-semibold text-muted">
          {Math.round(conversionRateOf(rollup.team))}% converted
          <span aria-hidden="true"> · </span>
          {formatMoney(rollup.team.cashCollected)} collected
        </p>
      </div>

      <Handle position={Position.Bottom} type="source" />
    </div>
  );
}

const nodeTypes = { org: OrgNode };

/* ---------------------------------------------------------------- */

/**
 * The company as a left-to-right flow: the owner, then the Office Admin,
 * then one branch per General Manager carrying that GM's whole chain.
 *
 * The owner and Office Admin rows are composed rather than read from
 * `manager` links — neither sits IN the reporting chain (the owner
 * usually has no employee record at all, and the Office Admin has one
 * with nobody reporting to it), so they cannot be derived from it.
 *
 * Branches start collapsed. With several GMs the first question this
 * screen answers is "which organisation am I looking at", and an
 * everything-open chart buries that under a hundred nodes.
 */
export default function OrgFlowChart({ detailPathFor, employees = [], performanceRows = [], regionNameFor }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(() => new Set());

  const toggle = useCallback((id) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // "Everyone with someone under them" — expanding an id that has no
  // children is harmless but pointless, and keeping the set tight makes
  // the collapse-all comparison below meaningful.
  const expandableIds = useMemo(
    () => employees.map((employee) => String(employee._id)),
    [employees],
  );

  // "Which ground does this branch cover" — names, not ids, and folded to
  // a count once the list gets long enough to stop being readable.
  const regionLabelFor = useCallback(
    (rollup) => {
      const ids = [...(rollup?.regionIds || [])];
      if (!ids.length) return "No region set";
      const names = ids.map((id) => regionNameFor?.(id)).filter(Boolean);
      if (!names.length) return `${ids.length} region${ids.length === 1 ? "" : "s"}`;
      if (names.length <= 2) return names.join(", ");
      return `${names[0]}, ${names[1]} +${names.length - 2} more`;
    },
    [regionNameFor],
  );

  // Opening a branch changes the diagram's whole footprint, and React
  // Flow only fits the view on mount — without this the new nodes land
  // off-screen and the chart looks like it did nothing. The animation is
  // also what makes expanding read as movement rather than a jump.
  const flowRef = useRef(null);
  useEffect(() => {
    const id = window.setTimeout(() => {
      flowRef.current?.fitView({ duration: 400, padding: 0.15 });
    }, 60);
    return () => window.clearTimeout(id);
  }, [expanded]);

  const { childrenByManager, byId } = useMemo(() => buildOrgIndex(employees), [employees]);
  const rollups = useMemo(
    () => buildRollups({ childrenByManager, employees, performanceRows }),
    [childrenByManager, employees, performanceRows],
  );

  const { nodes, edges } = useMemo(() => {
    const generalManagers = employees.filter((employee) => roleOf(employee) === "gm");
    const officeAdmins = employees.filter((employee) => roleOf(employee) === "oa");

    const gmIds = new Set(generalManagers.map((gm) => String(gm._id)));
    const oaIds = new Set(officeAdmins.map((oa) => String(oa._id)));
    const detached = employees.filter((employee) => {
      const id = String(employee._id);
      if (gmIds.has(id) || oaIds.has(id) || roleOf(employee) === "sa") return false;
      const managerId = employee.manager?._id ? String(employee.manager._id) : null;
      return !managerId || !byId.has(managerId);
    });

    const outNodes = [];
    const outEdges = [];
    let cursor = 0;

    const edge = (source, target) => ({
      id: `${source}->${target}`,
      source,
      target,
      type: "smoothstep",
      style: { stroke: "#9CB3A3", strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#9CB3A3", width: 14, height: 14 },
    });

    // Places a person and, when open, everyone under them. Returns the
    // node's own y so a parent can centre itself on its children.
    const place = (employee, depth, parentId) => {
      const id = String(employee._id);
      const kids = childrenByManager.get(id) || [];
      const isOpen = expanded.has(id);
      const childXs = [];

      if (isOpen && kids.length) {
        for (const kid of kids) childXs.push(place(kid, depth + 1, id));
      }

      // A parent sits centred over its children; a leaf takes the next
      // free column. Laying children out FIRST is what makes the centring
      // possible in one pass.
      const x = childXs.length
        ? (childXs[0] + childXs[childXs.length - 1]) / 2
        : (cursor += SIBLING_GAP) - SIBLING_GAP;

      outNodes.push({
        id,
        type: "org",
        position: { x, y: depth * TIER_GAP },
        data: {
          employee,
          kind: roleOf(employee) === "oa" ? "oa" : "employee",
          rollup: rollups.get(id) || emptyRollup(),
          regionLabel: regionLabelFor(rollups.get(id)),
          expanded: isOpen,
          hasChildren: kids.length > 0,
          onToggle: () => toggle(id),
          onOpen: detailPathFor ? () => navigate(detailPathFor(employee)) : undefined,
        },
      });
      if (parentId) outEdges.push(edge(parentId, id));
      return x;
    };

    // Owner -> Office Admins -> General Managers -> their chains.
    const oaXs = [];
    for (const oa of officeAdmins) {
      const oaId = String(oa._id);
      const gmXs = generalManagers.map((gm) => place(gm, 2, oaId));
      const oaX = gmXs.length ? (gmXs[0] + gmXs[gmXs.length - 1]) / 2 : (cursor += SIBLING_GAP) - SIBLING_GAP;

      outNodes.push({
        id: oaId,
        type: "org",
        position: { x: oaX, y: TIER_GAP },
        data: {
          employee: oa,
          kind: "oa",
          rollup: rollups.get(oaId) || emptyRollup(),
          regionLabel: regionLabelFor(rollups.get(oaId)),
          expanded: false,
          hasChildren: false,
          onToggle: () => {},
          onOpen: detailPathFor ? () => navigate(detailPathFor(oa)) : undefined,
        },
      });
      oaXs.push(oaX);
      break; // one spine — additional OAs are listed but never re-parent the GMs
    }

    // Any remaining OAs sit beside the first without owning the GM branches.
    for (const oa of officeAdmins.slice(1)) {
      const oaId = String(oa._id);
      const x = (cursor += SIBLING_GAP) - SIBLING_GAP;
      outNodes.push({
        id: oaId,
        type: "org",
        position: { x, y: TIER_GAP },
        data: {
          employee: oa, kind: "oa", rollup: rollups.get(oaId) || emptyRollup(),
          regionLabel: regionLabelFor(rollups.get(oaId)),
          expanded: false, hasChildren: false, onToggle: () => {},
          onOpen: detailPathFor ? () => navigate(detailPathFor(oa)) : undefined,
        },
      });
      oaXs.push(x);
    }

    // No Office Admin: the owner connects straight to the GMs.
    if (!officeAdmins.length) {
      generalManagers.forEach((gm) => place(gm, 2, "sa-root"));
    }

    for (const employee of detached) place(employee, 2, null);

    const saX = oaXs.length ? (oaXs[0] + oaXs[oaXs.length - 1]) / 2 : Math.max(cursor / 2 - SIBLING_GAP / 2, 0);
    outNodes.push({
      id: "sa-root",
      type: "org",
      position: { x: saX, y: 0 },
      data: {
        employee: null,
        kind: "sa",
        // Deliberately NOT the viewer's name: this node is the company,
        // and labelling it from whoever happens to be logged in put the
        // Office Admin's own name on the owner's node.
        label: "Super Admin",
        rollup: { ...emptyRollup(), team: totalOf(rollups, employees) },
        totalsLabel: "Whole company",
        regionLabel: regionLabelFor({
          regionIds: new Set(
            employees.map((e) => e.region?._id || e.region).filter(Boolean).map(String),
          ),
        }),
        expanded: true,
        hasChildren: false,
        onToggle: () => {},
        onOpen: undefined,
      },
    });
    for (const oa of officeAdmins) outEdges.push(edge("sa-root", String(oa._id)));

    return { nodes: outNodes, edges: outEdges };
  }, [byId, childrenByManager, detailPathFor, employees, expanded, navigate, regionLabelFor, rollups, toggle]);

  if (!employees.length) {
    return <EmptyState description="No active employees are visible to you." title="No hierarchy data" />;
  }

  const allOpen = expandableIds.every((id) => expanded.has(id));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* The accent ramp runs senior -> junior, so the legend reads in
            the same order the chart is laid out. */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-muted">
          <span className="uppercase tracking-[0.08em]">Tiers</span>
          {["gm", "rm", "asm", "so", "fo"].map((role) => (
            <span className="inline-flex items-center gap-1.5" key={role}>
              <span
                aria-hidden="true"
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: accentFor(role) }}
              />
              {role.toUpperCase()}
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            className="inline-flex min-h-9 items-center rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint"
            onClick={() => setExpanded(new Set(expandableIds))}
            type="button"
          >
            Expand all
          </button>
          <button
            className="inline-flex min-h-9 items-center rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint disabled:opacity-50"
            disabled={expanded.size === 0}
            onClick={() => setExpanded(new Set())}
            type="button"
          >
            Collapse all
          </button>
        </div>
      </div>

      <div className="h-[72vh] min-h-[560px] w-full overflow-hidden rounded-xl border border-forest/15 bg-paper">
      <ReactFlow
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.2}
        onInit={(instance) => { flowRef.current = instance; }}
        nodes={nodes}
        nodeTypes={nodeTypes}
        nodesConnectable={false}
        nodesDraggable={false}
        proOptions={{ hideAttribution: false }}
      >
        <Background color="#CFDCD2" gap={24} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
      </div>
    </div>
  );
}

/**
 * Company-wide totals for the owner's node: every ROOT's subtree summed.
 * Summing roots rather than every employee is what avoids counting a
 * person once for themselves and again inside their manager's rollup.
 */
function totalOf(rollups, employees) {
  const byId = new Map(employees.map((employee) => [String(employee._id), employee]));
  let total = emptyRollup().team;

  for (const employee of employees) {
    const managerId = employee.manager?._id ? String(employee.manager._id) : null;
    const isRoot = !managerId || !byId.has(managerId);
    if (!isRoot) continue;
    const entry = rollups.get(String(employee._id));
    if (!entry) continue;
    total = Object.fromEntries(
      Object.keys(total).map((key) => [key, (total[key] || 0) + (entry.team[key] || 0)]),
    );
  }
  return total;
}
