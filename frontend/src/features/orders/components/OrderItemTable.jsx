import { DataTable } from "../../../shared/components";
import { formatOrderAmount } from "../utils";

// Read-only, historical rendering: every cell comes from the item's own
// saved snapshot fields (productCode/productName/unit/rate/tax/...), never
// from a fresh Product lookup — a later Product/price edit can never
// change what an already-placed Order shows. Unlike Quotation items,
// Order items carry an already-computed `discountAmount` only (no raw
// discountType/discountValue survives the Quotation->Order conversion —
// confirmed in PHASE6_FRONTEND_API_CONTRACT.md), so Discount is rendered
// as a plain amount here, not a "10% (-₹X)" style breakdown.
export default function OrderItemTable({ items = [] }) {
  const columns = [
    {
      key: "productCode",
      header: "Product Code",
      cellClassName: "font-black text-forest",
      cell: (item) => item.productCode || "Not Set",
    },
    {
      key: "productName",
      header: "Product Name",
      role: "title",
      cellClassName: "font-black text-ink",
      cell: (item) => item.productName || "Unnamed Product",
    },
    {
      key: "description",
      header: "Description",
      cellClassName: "max-w-xs text-muted",
      cardClassName: "col-span-2",
      cell: (item) => item.description || "-",
    },
    {
      key: "unit",
      header: "Unit",
      cellClassName: "text-muted",
      cell: (item) => item.unit || "-",
    },
    {
      key: "quantity",
      header: "Quantity",
      align: "right",
      cellClassName: "text-ink",
      cell: (item) => item.quantity ?? 0,
    },
    {
      key: "rate",
      header: "Rate",
      align: "right",
      cellClassName: "text-ink",
      cell: (item) => formatOrderAmount(item.rate),
    },
    {
      key: "discount",
      header: "Discount",
      align: "right",
      cellClassName: "text-muted",
      cell: (item) => formatOrderAmount(item.discountAmount),
    },
    {
      key: "tax",
      header: "Tax",
      align: "right",
      cellClassName: "text-muted",
      cell: (item) => (item.taxRate ? `${item.taxRate}% (${formatOrderAmount(item.taxAmount)})` : "-"),
    },
    {
      key: "lineSubtotal",
      header: "Line Subtotal",
      align: "right",
      cellClassName: "font-semibold text-ink",
      cell: (item) => formatOrderAmount(item.lineSubtotal),
    },
    {
      key: "lineTotal",
      header: "Line Total",
      align: "right",
      cellClassName: "font-black text-forest",
      cell: (item) => formatOrderAmount(item.lineTotal),
    },
  ];

  return (
    <DataTable
      columns={columns}
      emptyMessage="No items on this order."
      minWidth="960px"
      rowKey={(item) => item._id || item.product}
      rows={items}
    />
  );
}
