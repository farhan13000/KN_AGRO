import { Link } from "react-router-dom";
import { Eye, Pencil, ToggleLeft, ToggleRight } from "lucide-react";
import { useAuth } from "../../../core/auth";
import { CATEGORY_STATUS } from "../constants";
import { PERMISSIONS, ROUTES } from "../../../shared/constants";
import CategoryStatusBadge from "./CategoryStatusBadge";

const formatDate = (value) => {
  if (!value) return "Not Set";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Not Set";
  return parsed.toLocaleDateString();
};

export default function CategoryTable({ categories = [], onStatusChange }) {
  const { hasPermission } = useAuth();
  const canManage = hasPermission(PERMISSIONS.CATEGORIES_MANAGE);

  return (
    <div className="overflow-hidden rounded-lg border border-forest/10 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[760px] w-full divide-y divide-forest/10 text-left text-sm">
          <thead className="bg-mint/70 text-xs font-black uppercase text-forest">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Sort</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest/10">
            {categories.map((category) => {
              const nextStatus =
                category.status === CATEGORY_STATUS.ACTIVE
                  ? CATEGORY_STATUS.INACTIVE
                  : CATEGORY_STATUS.ACTIVE;

              return (
                <tr className="align-top transition hover:bg-mint/35" key={category._id}>
                  <td className="px-4 py-3 font-black text-ink">{category.name}</td>
                  <td className="px-4 py-3 text-muted">{category.slug}</td>
                  <td className="px-4 py-3">
                    <CategoryStatusBadge status={category.status} />
                  </td>
                  <td className="px-4 py-3 text-muted">{category.sortOrder ?? 0}</td>
                  <td className="px-4 py-3 text-muted">{formatDate(category.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        aria-label={`View public category ${category.name}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-forest ring-1 ring-forest/15 transition hover:bg-mint"
                        to={`/categories/${category.slug}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      {canManage ? (
                        <>
                          <Link
                            aria-label={`Edit ${category.name}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-forest ring-1 ring-forest/15 transition hover:bg-mint"
                            to={`${ROUTES.SUPER_ADMIN.CATEGORIES}/${category._id}/edit`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            aria-label={`Set ${category.name} ${nextStatus.toLowerCase()}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-forest ring-1 ring-forest/15 transition hover:bg-mint"
                            onClick={() => onStatusChange?.(category, nextStatus)}
                            type="button"
                          >
                            {nextStatus === CATEGORY_STATUS.ACTIVE ? (
                              <ToggleRight className="h-4 w-4" />
                            ) : (
                              <ToggleLeft className="h-4 w-4" />
                            )}
                          </button>
                        </>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
