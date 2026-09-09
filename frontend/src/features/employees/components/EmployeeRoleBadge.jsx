import { ROLE_LABELS, normalizeRoleName } from "../../../shared/constants";
import { formatEmployeeRoleShort, getEmployeeRoleName } from "../utils/employeeFormatters";

/**
 * The role a person holds, shown beside their name.
 *
 * Takes either a whole employee or a bare role name, because the two
 * shapes both turn up: list rows carry `user.role`, while some payloads
 * only carry the string.
 *
 * The colours climb the chain rather than being arbitrary — an SA reads
 * darkest, an FO lightest — so a tier is recognisable at a glance in a
 * tree without reading the text.
 */
const ROLE_TONE = {
  sa: "bg-forest text-white",
  oa: "bg-agriculture text-white",
  gm: "bg-forest/85 text-white",
  rm: "bg-forest/70 text-white",
  asm: "bg-forest/50 text-white",
  so: "bg-mint text-forest ring-1 ring-forest/20",
  fo: "bg-white text-forest ring-1 ring-forest/20",
};

export default function EmployeeRoleBadge({ employee, full = false, roleName }) {
  const name = roleName ? normalizeRoleName(roleName) : getEmployeeRoleName(employee);
  if (!name) return null;

  const label = full
    ? ROLE_LABELS[name] || name.toUpperCase()
    : formatEmployeeRoleShort({ user: { role: { name } } });

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-black uppercase tracking-wide ${
        ROLE_TONE[name] || "bg-mint text-forest ring-1 ring-forest/20"
      }`}
      title={ROLE_LABELS[name] || name}
    >
      {label}
    </span>
  );
}
