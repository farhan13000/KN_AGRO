// Renders the exact backend address subdocument shape used by both
// Customer.billingAddress/shippingAddress and Invoice's frozen
// billingAddressSnapshot/shippingAddressSnapshot (six fields: line1,
// line2, city, state, postalCode, country — no `_id`). Deliberately
// generic/domain-light (not owned by features/customers) since it renders
// identically whether the address is live-editable data or a historical
// snapshot — the caller decides which by what it passes in, this
// component never fetches anything itself.
export default function AddressDisplay({ address, label = "Address" }) {
  const hasAddress = Boolean(address) && Object.values(address).some((value) => Boolean(value));

  return (
    <div className="rounded-lg border border-forest/10 bg-white px-4 py-3">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-muted">{label}</p>
      {hasAddress ? (
        <div className="mt-1 space-y-0.5 text-sm font-semibold leading-6 text-ink">
          {address.line1 ? <p>{address.line1}</p> : null}
          {address.line2 ? <p>{address.line2}</p> : null}
          {[address.city, address.state, address.postalCode].some(Boolean) ? (
            <p>{[address.city, address.state, address.postalCode].filter(Boolean).join(", ")}</p>
          ) : null}
          {address.country ? <p>{address.country}</p> : null}
        </div>
      ) : (
        <p className="mt-1 text-sm font-semibold text-muted">Not Set</p>
      )}
    </div>
  );
}
