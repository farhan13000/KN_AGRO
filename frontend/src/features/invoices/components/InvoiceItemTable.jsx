import { DataTable } from "../../../shared/components";
import { formatInvoiceAmount } from "../utils";

// Prompt 40: read-only, historical rendering only — every cell comes from
// the item's own saved snapshot fields, never a fresh Product or Order
// lookup. Same shape as OrderItemTable (Invoice items are copied straight
// from the source Order's own already-frozen items — see
// invoice.model.js's own comment that Invoice items are "identical shape
// to orderItemSchema... should copy Order snapshots, do not recalculate
// using current Product catalog").
export default function InvoiceItemTable({ items = [] }) {
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
      cell: (item) => formatInvoiceAmount(item.rate),
    },
    {
      key: "discount",
      header: "Discount",
      align: "right",
      cellClassName: "text-muted",
      cell: (item) => formatInvoiceAmount(item.discountAmount),
    },
    {
      key: "tax",
      header: "Tax",
      align: "right",
      cellClassName: "text-muted",
      cell: (item) => (item.taxRate ? `${item.taxRate}% (${formatInvoiceAmount(item.taxAmount)})` : "-"),
    },
    {
      key: "lineSubtotal",
      header: "Line Subtotal",
      align: "right",
      cellClassName: "font-semibold text-ink",
      cell: (item) => formatInvoiceAmount(item.lineSubtotal),
    },
    {
      key: "lineTotal",
      header: "Line Total",
      align: "right",
      cellClassName: "font-black text-forest",
      cell: (item) => formatInvoiceAmount(item.lineTotal),
    },
  ];

  return (
    <DataTable
      columns={columns}
      emptyMessage="No items on this invoice."
      minWidth="960px"
      rowKey={(item) => item._id || item.product}
      rows={items}
    />
  );
}
