import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getApiErrorMessage } from "../../../core/api";
import Card from "../../../shared/components/Card";
import TextInput from "../../../shared/forms/TextInput";
import Textarea from "../../../shared/forms/Textarea";
import { useDSRActions } from "../hooks";

/**
 * Every numeric field defaults to 0 and every text field to "" on the
 * backend (dsr.model.js), so nothing here is required — which is exactly
 * why the form used to ask for nineteen things at the end of a day in the
 * field, and got zeros.
 *
 * So the fields are split rather than removed: the six below are what a
 * day is actually reported by, and they are all a person has to look at.
 * The rest still exist, still submit, and still reach the same model —
 * they just sit behind "More detail", closed by default. Deleting them
 * would have thrown away data the business already collects; leaving them
 * all on screen was the thing making the report a chore.
 */
const CORE_NUMBER_FIELDS = [
  { name: "customerVisits", label: "Customer Visits" },
  { name: "dealerVisits", label: "Dealer Visits" },
  { name: "newLeadsGenerated", label: "New Leads" },
  { name: "leadsConverted", label: "Leads Converted" },
  { name: "ordersGenerated", label: "Orders Taken" },
];

const MORE_NUMBER_FIELDS = [
  { group: "Field Activity", name: "newCustomerVisits", label: "New Customer Visits" },
  { group: "Field Activity", name: "followUpVisits", label: "Follow-Up Visits" },
  { group: "Field Activity", name: "marketVisits", label: "Market Visits" },
  { group: "Lead Activity", name: "leadsFollowedUp", label: "Leads Followed Up" },
  { group: "Lead Activity", name: "leadsLost", label: "Leads Lost" },
  { group: "Sales", name: "productsSold", label: "Products Sold" },
  { group: "Sales", name: "newCustomers", label: "New Customers" },
];

const NUMBER_FIELDS = [...CORE_NUMBER_FIELDS, ...MORE_NUMBER_FIELDS];

// The one note worth writing every day, and the ones worth writing when
// there is something to say.
const CORE_TEXT_FIELD = { name: "keyActivities", label: "What you did today" };

const MORE_TEXT_FIELDS = [
  { name: "issues", label: "Issues" },
  { name: "customerFeedback", label: "Customer Feedback" },
  { name: "competitorInfo", label: "Competitor Info" },
  { name: "nextDayPlan", label: "Next Day Plan" },
  { name: "remarks", label: "Remarks" },
];

const TEXT_FIELDS = [CORE_TEXT_FIELD, ...MORE_TEXT_FIELDS];

const emptyValues = () => ({
  date: "",
  salesAmount: "",
  ...Object.fromEntries(NUMBER_FIELDS.map((f) => [f.name, ""])),
  ...Object.fromEntries(TEXT_FIELDS.map((f) => [f.name, ""])),
});

const groupedMoreFields = MORE_NUMBER_FIELDS.reduce((acc, field) => {
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
  const [showMore, setShowMore] = useState(false);
  const actions = useDSRActions({
    onSuccess: async (result) => {
      setValues(emptyValues());
      setShowMore(false);
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

    // Collapsed fields still submit whatever they hold — closing the
    // section hides them, it does not discard what was typed.
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
        <h2 className="text-lg font-black text-ink">Today</h2>
        <p className="mt-1 text-sm text-muted">
          Six numbers and a line about the day. Leave anything that did not happen blank.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CORE_NUMBER_FIELDS.map((field) => (
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

        <div className="mt-4">
          <Textarea
            id={`dsr-${CORE_TEXT_FIELD.name}`}
            label={CORE_TEXT_FIELD.label}
            maxLength={2000}
            name={CORE_TEXT_FIELD.name}
            onChange={handleChange}
            value={values[CORE_TEXT_FIELD.name]}
          />
        </div>

        <div className="mt-4 max-w-xs">
          <TextInput
            id="dsr-date"
            label="Date (leave blank for today)"
            name="date"
            onChange={handleChange}
            type="date"
            value={values.date}
          />
        </div>
      </Card>

      <Card className="p-5">
        <button
          aria-expanded={showMore}
          className="flex w-full items-center justify-between gap-3 text-left"
          onClick={() => setShowMore((open) => !open)}
          type="button"
        >
          <span>
            <span className="block text-lg font-black text-ink">More detail</span>
            <span className="mt-1 block text-sm text-muted">
              Optional. Only worth opening when there is something to record.
            </span>
          </span>
          {showMore ? (
            <ChevronUp className="h-5 w-5 shrink-0 text-forest" />
          ) : (
            <ChevronDown className="h-5 w-5 shrink-0 text-forest" />
          )}
        </button>

        {showMore ? (
          <div className="mt-5 space-y-5">
            {Object.entries(groupedMoreFields).map(([group, fields]) => (
              <div key={group}>
                <h3 className="text-sm font-black uppercase tracking-wide text-muted">{group}</h3>
                <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
              </div>
            ))}

            <div>
              <h3 className="text-sm font-black uppercase tracking-wide text-muted">Notes</h3>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {MORE_TEXT_FIELDS.map((field) => (
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
            </div>
          </div>
        ) : null}
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
