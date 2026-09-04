import { useState } from "react";
import { getApiErrorMessage } from "../../../core/api";
import Card from "../../../shared/components/Card";
import TextInput from "../../../shared/forms/TextInput";
import Textarea from "../../../shared/forms/Textarea";
import { useDSRActions } from "../hooks";

// Every numeric field defaults to 0 and every text field to "" on the
// backend (dsr.model.js) — nothing here is actually required, matching
// the model directly rather than guessing which fields are mandatory.
const NUMBER_FIELDS = [
  { group: "Field Activity", name: "customerVisits", label: "Customer Visits" },
  { group: "Field Activity", name: "newCustomerVisits", label: "New Customer Visits" },
  { group: "Field Activity", name: "followUpVisits", label: "Follow-Up Visits" },
  { group: "Field Activity", name: "dealerVisits", label: "Dealer Visits" },
  { group: "Field Activity", name: "marketVisits", label: "Market Visits" },
  { group: "Lead Activity", name: "newLeadsGenerated", label: "New Leads Generated" },
  { group: "Lead Activity", name: "leadsFollowedUp", label: "Leads Followed Up" },
  { group: "Lead Activity", name: "leadsConverted", label: "Leads Converted" },
  { group: "Lead Activity", name: "leadsLost", label: "Leads Lost" },
  { group: "Sales", name: "ordersGenerated", label: "Orders Generated" },
  { group: "Sales", name: "productsSold", label: "Products Sold" },
  { group: "Sales", name: "newCustomers", label: "New Customers" },
];

const TEXT_FIELDS = [
  { name: "keyActivities", label: "Key Activities" },
  { name: "issues", label: "Issues" },
  { name: "customerFeedback", label: "Customer Feedback" },
  { name: "competitorInfo", label: "Competitor Info" },
  { name: "nextDayPlan", label: "Next Day Plan" },
  { name: "remarks", label: "Remarks" },
];

const emptyValues = () => ({
  date: "",
  salesAmount: "",
  ...Object.fromEntries(NUMBER_FIELDS.map((f) => [f.name, ""])),
  ...Object.fromEntries(TEXT_FIELDS.map((f) => [f.name, ""])),
});

const groupedNumberFields = NUMBER_FIELDS.reduce((acc, field) => {
  (acc[field.group] ||= []).push(field);
  return acc;
}, {});

/**
 * Shared between the Employee (FO) and Sales Manager (SO) portal submit
 * pages — both hold DSR_CREATE. A same-day resubmission surfaces the
 * backend's own specific 409 ("You have already submitted a DSR for this
 * day") verbatim, not a generic error.
 */
export default function DSRSubmitForm({ onSuccess }) {
  const [values, setValues] = useState(emptyValues);
  const [formError, setFormError] = useState("");
  const actions = useDSRActions({
    onSuccess: async (result) => {
      setValues(emptyValues());
      await onSuccess?.(result);
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const payload = {};
    if (values.date) payload.date = values.date;
    if (values.salesAmount !== "") payload.salesAmount = Number(values.salesAmount);
    for (const field of NUMBER_FIELDS) {
      if (values[field.name] !== "") payload[field.name] = Number(values[field.name]);
    }
    for (const field of TEXT_FIELDS) {
      if (values[field.name].trim()) payload[field.name] = values[field.name].trim();
    }

    try {
      await actions.submitDSR.mutate(payload);
    } catch (error) {
      // The backend's own 409 ("You have already submitted a DSR for
      // this day") is the whole point of surfacing this inline verbatim.
      setFormError(getApiErrorMessage(error));
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <Card className="p-5">
        <h2 className="text-lg font-black text-ink">Report Date</h2>
        <p className="mt-1 text-sm text-muted">Leave blank to submit for today.</p>
        <div className="mt-4 max-w-xs">
          <TextInput id="dsr-date" label="Date (optional)" name="date" onChange={handleChange} type="date" value={values.date} />
        </div>
      </Card>

      {Object.entries(groupedNumberFields).map(([group, fields]) => (
        <Card className="p-5" key={group}>
          <h2 className="text-lg font-black text-ink">{group}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {fields.map((field) => (
              <TextInput
                id={`dsr-${field.name}`}
                key={field.name}
                label={field.label}
                min="0"
                name={field.name}
                onChange={handleChange}
                step="1"
                type="number"
                value={values[field.name]}
              />
            ))}
          </div>
        </Card>
      ))}

      <Card className="p-5">
        <h2 className="text-lg font-black text-ink">Sales</h2>
        <div className="mt-4 max-w-xs">
          <TextInput
            id="dsr-salesAmount"
            label="Sales Amount (INR)"
            min="0"
            name="salesAmount"
            onChange={handleChange}
            step="0.01"
            type="number"
            value={values.salesAmount}
          />
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-lg font-black text-ink">Notes</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {TEXT_FIELDS.map((field) => (
            <Textarea
              id={`dsr-${field.name}`}
              key={field.name}
              label={field.label}
              maxLength={2000}
              name={field.name}
              onChange={handleChange}
              value={values[field.name]}
            />
          ))}
        </div>
      </Card>

      {formError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{formError}</p>
      ) : null}

      <div className="flex justify-end">
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-forest px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture disabled:opacity-60"
          disabled={actions.submitDSR.isLoading}
          type="submit"
        >
          {actions.submitDSR.isLoading ? "Submitting..." : "Submit DSR"}
        </button>
      </div>
    </form>
  );
}
