import { Link } from "react-router-dom";
import { DataTable } from "../../../shared/components";
import { ROUTES } from "../../../shared/constants";
import { getProductUnitLabel } from "../../products/utils";
import { INVENTORY_TRANSACTION_TYPE_LABELS } from "../constants";

const formatDateTime = (value) => {
  if (!value) return "Not Set";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Not Set";
  return parsed.toLocaleString();
};

const getTransactionLabel = (type) => INVENTORY_TRANSACTION_TYPE_LABELS[type] || type || "Movement";

const getReference = (transaction) => {
  if (!transaction?.referenceType && !transaction?.referenceId) return "Not Set";
  return [transaction.referenceType, transaction.referenceId].filter(Boolean).join(" / ");
};

export default function InventoryTransactionTable({ transactions = [] }) {
  const columns = [
    {
      key: "transactionCode",
      header: "Transaction Code",
      cellClassName: "font-black text-forest",
      cell: (transaction) => transaction.transactionCode || "Not Set",
    },
    {
      key: "product",
      header: "Product",
      role: "title",
      cell: (transaction) => {
        const product = transaction.product || {};
        return (
          <>
            {product._id ? (
              <Link
                className="font-black text-ink transition hover:text-forest"
                to={`${ROUTES.SUPER_ADMIN.INVENTORY}/${product._id}`}
              >
                {product.name || product.productCode || "Product"}
              </Link>
            ) : (
              <span className="font-black text-ink">Not Set</span>
            )}
            <p className="mt-1 text-xs font-semibold text-muted">{product.productCode || ""}</p>
          </>
        );
      },
    },
    {
      key: "type",
      header: "Type",
      cellClassName: "text-muted",
      cell: (transaction) => getTransactionLabel(transaction.type),
    },
    {
      key: "quantity",
      header: "Quantity",
      cellClassName: "font-bold text-ink",
      cell: (transaction) => `${transaction.quantity ?? 0} ${getProductUnitLabel(transaction.product?.unit)}`,
    },
    {
      key: "previousStock",
      header: "Previous Stock",
      cellClassName: "text-muted",
      cell: (transaction) => transaction.previousStock ?? 0,
    },
    {
      key: "newStock",
      header: "New Stock",
      cellClassName: "text-muted",
      cell: (transaction) => transaction.newStock ?? 0,
    },
    {
      key: "previousReservedStock",
      header: "Previous Reserved",
      cellClassName: "text-muted",
      cell: (transaction) => transaction.previousReservedStock ?? 0,
    },
    {
      key: "newReservedStock",
      header: "New Reserved",
      cellClassName: "text-muted",
      cell: (transaction) => transaction.newReservedStock ?? 0,
    },
    {
      key: "reference",
      header: "Reference",
      cellClassName: "text-muted",
      cell: getReference,
    },
    {
      key: "reason",
      header: "Reason",
      cellClassName: "text-muted",
      cell: (transaction) => transaction.reason || "Not Set",
    },
    {
      key: "remarks",
      header: "Remarks",
      cellClassName: "text-muted",
      cell: (transaction) => transaction.remarks || "Not Set",
    },
    {
      key: "performedBy",
      header: "Performed By",
      cellClassName: "text-muted",
      cell: (transaction) => transaction.performedBy?.name || "System",
    },
    {
      key: "createdAt",
      header: "Date",
      cellClassName: "text-muted",
      cell: (transaction) => formatDateTime(transaction.createdAt),
    },
  ];

  return (
    <DataTable
      caption="Read-only inventory transaction ledger. Historical transactions can be viewed, filtered, searched, and paginated but not edited or deleted."
      columns={columns}
      minWidth="1240px"
      rows={transactions}
    />
  );
}
