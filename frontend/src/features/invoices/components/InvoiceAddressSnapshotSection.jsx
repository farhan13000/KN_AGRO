import AddressDisplay from "../../../shared/components/AddressDisplay";
import Card from "../../../shared/components/Card";

// Prompt 39: `billingAddressSnapshot`/`shippingAddressSnapshot` are copied
// from the Customer's address once, at invoice-generation time, and frozen
// forever after (invoice.model.js) — a later Customer address edit (Prompt
// 22) never touches an already-generated Invoice. This section renders
// ONLY those two frozen snapshot fields off the invoice record itself; it
// never re-fetches or falls back to the live Customer address, so it can
// never silently show data that didn't exist at the moment this invoice
// was created.
export default function InvoiceAddressSnapshotSection({ invoice }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <Card className="p-5">
        <AddressDisplay address={invoice.billingAddressSnapshot} label="Billing Address (at invoice date)" />
      </Card>
      <Card className="p-5">
        <AddressDisplay address={invoice.shippingAddressSnapshot} label="Shipping Address (at invoice date)" />
      </Card>
    </div>
  );
}
