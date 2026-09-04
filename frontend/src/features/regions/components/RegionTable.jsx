import { Link } from "react-router-dom";
import { Pencil } from "lucide-react";
import { useAuth } from "../../../core/auth";
import { PERMISSIONS } from "../../../shared/constants";
import RegionStatusBadge from "./RegionStatusBadge";

const formatDate = (value) => {
  if (!value) return "Not Set";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Not Set";
  return parsed.toLocaleDateString();
};

export default function RegionTable({ regions = [], getEditHref }) {
  const { hasPermission } = useAuth();
  const canManage = hasPermission(PERMISSIONS.REGION_UPDATE);

  return (
    <div className="overflow-hidden rounded-lg border border-forest/10 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[720px] w-full divide-y divide-forest/10 text-left text-sm">
          <thead className="bg-mint/70 text-xs font-black uppercase text-forest">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              {canManage && getEditHref ? <th className="px-4 py-3 text-right">Actions</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-forest/10">
            {regions.map((region) => (
              <tr className="align-top transition hover:bg-mint/35" key={region._id}>
                <td className="px-4 py-3 font-black text-ink">{region.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted">{region.code}</td>
                <td className="px-4 py-3 text-muted">{region.description || "—"}</td>
                <td className="px-4 py-3">
                  <RegionStatusBadge status={region.status} />
                </td>
                <td className="px-4 py-3 text-muted">{formatDate(region.createdAt)}</td>
                {canManage && getEditHref ? (
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <Link
                        aria-label={`Edit ${region.name}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-forest ring-1 ring-forest/15 transition hover:bg-mint"
                        to={getEditHref(region)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
