import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { DataTable, rowActionClass } from "../../../shared/components";
import CustomerStatusBadge from "./CustomerStatusBadge";

export default function CustomerTable({ customers = [], detailPath }) {
  const columns = [
    {
      key: "customerCode",
      header: "Customer Code",
      cellClassName: "font-black text-forest",
      cell: (customer) => customer.customerCode || "Pending",
    },
    {
      key: "name",
      header: "Name",
      role: "title",
      cellClassName: "font-black text-ink",
      cell: (customer) => customer.name || "Unnamed Customer",
    },
    {
      key: "companyName",
      header: "Company",
      cellClassName: "text-muted",
      cell: (customer) => customer.companyName || "Not Set",
    },
    {
      key: "phone",
      header: "Phone",
      cellClassName: "text-muted",
      cell: (customer) =>
        customer.phone ? (
          <a className="font-semibold text-forest md:font-normal md:text-muted" href={`tel:${customer.phone}`}>
            {customer.phone}
          </a>
        ) : (
          "Not Set"
        ),
    },
    {
      key: "email",
      header: "Email",
      cellClassName: "text-muted",
      cell: (customer) =>
        customer.email ? (
          <a className="break-all font-semibold text-forest md:font-normal md:text-muted" href={`mailto:${customer.email}`}>
            {customer.email}
          </a>
        ) : (
          "Not Set"
        ),
    },
    {
      key: "location",
      header: "Location",
      cellClassName: "text-muted",
      cell: (customer) => customer.location || "Not Set",
    },
    {
      key: "status",
      header: "Status",
      role: "badge",
      cell: (customer) => <CustomerStatusBadge status={customer.status} />,
    },
    {
      key: "paymentTerms",
      header: "Payment Terms",
      cellClassName: "text-muted",
      cell: (customer) => customer.paymentTerms || "Not Set",
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      role: "actions",
      cell: (customer) => (
        <div className="flex justify-end">
          <Link
            aria-label={`View ${customer.name || "customer"}`}
            className={rowActionClass}
            to={detailPath(customer)}
          >
            <Eye className="h-4 w-4" />
            <span className="md:sr-only">View</span>
          </Link>
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} minWidth="1080px" rows={customers} />;
}
