import { Link } from "react-router-dom";
import { Eye, Pencil } from "lucide-react";
import { useAuth } from "../../../core/auth";
import { PERMISSIONS } from "../../../shared/constants";
import { DISTRICT_ASSIGNMENT_STATUS_LABELS } from "../constants";
import DistrictStatusBadge from "./DistrictStatusBadge";

const formatDate = (value) => {
  if (!value) return "Not Set";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Not Set";
  return parsed.toLocaleDateString();
};

export default function DistrictTable({ districts = [], getDetailHref, getEditHref }) {
  const { hasPermission } = useAuth();
  const canManage = hasPermission(PERMISSIONS.DISTRICT_UPDATE);

  return (
    <div className="overflow-hidden rounded-lg border border-forest/10 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[880px] w-full divide-y divide-forest/10 text-left text-sm">
          <thead className="bg-mint/70 text-xs font-black uppercase text-forest">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Region</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Assignment</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest/10">
            {districts.map((district) => (
              <tr className="align-top transition hover:bg-mint/35" key={district._id}>
                <td className="px-4 py-3 font-black text-ink">{district.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted">{district.code}</td>
                <td className="px-4 py-3 text-muted">{district.region?.name || "—"}</td>
                <td className="px-4 py-3">
                  <DistrictStatusBadge status={district.status} />
                </td>
                <td className="px-4 py-3 text-muted">
                  {district.assignmentStatus
                    ? DISTRICT_ASSIGNMENT_STATUS_LABELS[district.assignmentStatus] || district.assignmentStatus
                    : district.assignedRM || district.assignedASM
                      ? "Assigned"
                      : "Unassigned"}
                </td>
                <td className="px-4 py-3 text-muted">{formatDate(district.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    {getDetailHref ? (
                      <Link
                        aria-label={`View ${district.name}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-forest ring-1 ring-forest/15 transition hover:bg-mint"
                        to={getDetailHref(district)}
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    ) : null}
                    {canManage && getEditHref ? (
                      <Link
                        aria-label={`Edit ${district.name}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-forest ring-1 ring-forest/15 transition hover:bg-mint"
                        to={getEditHref(district)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
