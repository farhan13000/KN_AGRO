import TextInput from "./TextInput";

// Edits the same six-field address shape AddressDisplay renders. Used
// twice per Customer form (billing + shipping) — `idPrefix` keeps input
// ids unique across the two instances on one page.
export default function AddressForm({ idPrefix, legend, onChange, value = {} }) {
  const update = (field) => (event) => onChange({ ...value, [field]: event.target.value });

  return (
    <fieldset className="space-y-4">
      {legend ? <legend className="mb-1 text-sm font-black text-ink">{legend}</legend> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          id={`${idPrefix}-line1`}
          label="Address Line 1"
          onChange={update("line1")}
          value={value.line1 || ""}
        />
        <TextInput
          id={`${idPrefix}-line2`}
          label="Address Line 2"
          onChange={update("line2")}
          value={value.line2 || ""}
        />
        <TextInput id={`${idPrefix}-city`} label="City" onChange={update("city")} value={value.city || ""} />
        <TextInput id={`${idPrefix}-state`} label="State" onChange={update("state")} value={value.state || ""} />
        <TextInput
          id={`${idPrefix}-postal-code`}
          label="Postal Code"
          onChange={update("postalCode")}
          value={value.postalCode || ""}
        />
        <TextInput
          id={`${idPrefix}-country`}
          label="Country"
          onChange={update("country")}
          value={value.country || ""}
        />
      </div>
    </fieldset>
  );
}
