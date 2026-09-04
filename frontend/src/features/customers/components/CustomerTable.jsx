import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import CustomerStatusBadge from "./CustomerStatusBadge";

export default function CustomerTable({ customers = [], detailPath }) {
  return (
    <div className="overflow-hidden rounded-lg border border-forest/10 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] divide-y divide-forest/10 text-left text-sm">
          <thead className="bg-mint/70 text-xs font-black uppercase text-forest">
            <tr>
              <th className="px-4 py-3">Customer Code</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payment Terms</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest/10">
            {customers.map((customer) => (
              <tr className="align-top transition hover:bg-mint/35" key={customer._id}>
                <td className="px-4 py-3 font-black text-forest">{customer.customerCode || "Pending"}</td>
                <td className="px-4 py-3 font-black text-ink">{customer.name || "Unnamed Customer"}</td>
                <td className="px-4 py-3 text-muted">{customer.companyName || "Not Set"}</td>
                <td className="px-4 py-3 text-muted">{customer.phone || "Not Set"}</td>
                <td className="px-4 py-3 text-muted">{customer.email || "Not Set"}</td>
                <td className="px-4 py-3 text-muted">{customer.location || "Not Set"}</td>
                <td className="px-4 py-3">
                  <CustomerStatusBadge status={customer.status} />
                </td>
                <td className="px-4 py-3 text-muted">{customer.paymentTerms || "Not Set"}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <Link
                      aria-label={`View ${customer.name || "customer"}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-forest ring-1 ring-forest/15 transition hover:bg-mint"
                      to={detailPath(customer)}
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
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
