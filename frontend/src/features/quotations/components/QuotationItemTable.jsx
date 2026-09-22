import { DataTable } from "../../../shared/components";
import { formatQuotationAmount, formatQuotationItemDiscount } from "../utils";

// Read-only, historical rendering: every cell comes from the item's own
// saved snapshot fields (productCode/productName/unit/rate/tax/...), never
// from a fresh Product lookup, so a later Product edit can never change
// what an old quotation shows.
export default function QuotationItemTable({ items = [] }) {
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
      cell: (item) => formatQuotationAmount(item.rate),
    },
    {
      key: "discount",
      header: "Discount",
      align: "right",
      cellClassName: "text-muted",
      cell: (item) => formatQuotationItemDiscount(item),
    },
    {
      key: "tax",
      header: "Tax",
      align: "right",
      cellClassName: "text-muted",
      cell: (item) => (item.taxRate ? `${item.taxRate}% (${formatQuotationAmount(item.taxAmount)})` : "-"),
    },
    {
      key: "lineSubtotal",
      header: "Line Subtotal",
      align: "right",
      cellClassName: "font-semibold text-ink",
      cell: (item) => formatQuotationAmount(item.lineSubtotal),
    },
    {
      key: "lineTotal",
      header: "Line Total",
      align: "right",
      cellClassName: "font-black text-forest",
      cell: (item) => formatQuotationAmount(item.lineTotal),
    },
  ];

  return (
    <DataTable
      columns={columns}
      emptyMessage="No items on this quotation."
      minWidth="960px"
      rowKey={(item) => item._id || item.product}
      rows={items}
    />
  );
}
