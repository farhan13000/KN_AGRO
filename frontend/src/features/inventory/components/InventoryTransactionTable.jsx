import { Link } from "react-router-dom";
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
  return (
    <div className="overflow-hidden rounded-lg border border-forest/10 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[1240px] w-full divide-y divide-forest/10 text-left text-sm">
          <caption className="sr-only">
            Read-only inventory transaction ledger. Historical transactions can be viewed, filtered, searched, and paginated but not edited or deleted.
          </caption>
          <thead className="bg-mint/70 text-xs font-black uppercase text-forest">
            <tr>
              <th className="px-4 py-3">Transaction Code</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Previous Stock</th>
              <th className="px-4 py-3">New Stock</th>
              <th className="px-4 py-3">Previous Reserved</th>
              <th className="px-4 py-3">New Reserved</th>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Remarks</th>
              <th className="px-4 py-3">Performed By</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest/10">
            {transactions.map((transaction) => {
              const product = transaction.product || {};
              const unit = getProductUnitLabel(product.unit);

              return (
                <tr className="align-top transition hover:bg-mint/35" key={transaction._id}>
                  <td className="px-4 py-3 font-black text-forest">{transaction.transactionCode || "Not Set"}</td>
                  <td className="px-4 py-3">
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
                  </td>
                  <td className="px-4 py-3 text-muted">{getTransactionLabel(transaction.type)}</td>
                  <td className="px-4 py-3 font-bold text-ink">
                    {transaction.quantity ?? 0} {unit}
                  </td>
                  <td className="px-4 py-3 text-muted">{transaction.previousStock ?? 0}</td>
                  <td className="px-4 py-3 text-muted">{transaction.newStock ?? 0}</td>
                  <td className="px-4 py-3 text-muted">{transaction.previousReservedStock ?? 0}</td>
                  <td className="px-4 py-3 text-muted">{transaction.newReservedStock ?? 0}</td>
                  <td className="px-4 py-3 text-muted">{getReference(transaction)}</td>
                  <td className="px-4 py-3 text-muted">{transaction.reason || "Not Set"}</td>
                  <td className="px-4 py-3 text-muted">{transaction.remarks || "Not Set"}</td>
                  <td className="px-4 py-3 text-muted">{transaction.performedBy?.name || "System"}</td>
                  <td className="px-4 py-3 text-muted">{formatDateTime(transaction.createdAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
