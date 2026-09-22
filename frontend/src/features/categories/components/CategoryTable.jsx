import { Link } from "react-router-dom";
import { Eye, Pencil, ToggleLeft, ToggleRight } from "lucide-react";
import { useAuth } from "../../../core/auth";
import { CATEGORY_STATUS } from "../constants";
import { DataTable, rowIconActionClass } from "../../../shared/components";
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

  const columns = [
    {
      key: "name",
      header: "Name",
      role: "title",
      cellClassName: "font-black text-ink",
      cell: (category) => category.name,
    },
    {
      key: "slug",
      header: "Slug",
      cellClassName: "text-muted",
      cell: (category) => category.slug,
    },
    {
      key: "status",
      header: "Status",
      role: "badge",
      cell: (category) => <CategoryStatusBadge status={category.status} />,
    },
    {
      key: "sortOrder",
      header: "Sort",
      cellClassName: "text-muted",
      cell: (category) => category.sortOrder ?? 0,
    },
    {
      key: "createdAt",
      header: "Created",
      cellClassName: "text-muted",
      cell: (category) => formatDate(category.createdAt),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      role: "actions",
      cell: (category) => {
        const nextStatus =
          category.status === CATEGORY_STATUS.ACTIVE ? CATEGORY_STATUS.INACTIVE : CATEGORY_STATUS.ACTIVE;

        return (
          <div className="flex justify-end gap-2">
            <Link
              aria-label={`View public category ${category.name}`}
              className={rowIconActionClass}
              to={`/categories/${category.slug}`}
            >
              <Eye className="h-4 w-4" />
            </Link>
            {canManage ? (
              <>
                <Link
                  aria-label={`Edit ${category.name}`}
                  className={rowIconActionClass}
                  to={`${ROUTES.SUPER_ADMIN.CATEGORIES}/${category._id}/edit`}
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  aria-label={`Set ${category.name} ${nextStatus.toLowerCase()}`}
                  className={rowIconActionClass}
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
        );
      },
    },
  ];

  return <DataTable columns={columns} minWidth="760px" rows={categories} />;
}
