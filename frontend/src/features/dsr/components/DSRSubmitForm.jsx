import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Plus, RefreshCw, Trash2 } from "lucide-react";
import { getApiErrorMessage } from "../../../core/api";
import Card from "../../../shared/components/Card";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import SearchableMultiSelect from "../../../shared/forms/SearchableMultiSelect";
import SearchableSelect from "../../../shared/forms/SearchableSelect";
import TextInput from "../../../shared/forms/TextInput";
import Textarea from "../../../shared/forms/Textarea";
import { formatMoney } from "../../../shared/utils";
import { useDSRActions, useMyDSRDraft } from "../hooks";

/**
 * The Daily Sales Report, laid out like the paper form: who, which day,
 * and one row per retailer/lead visited — the route taken, meter reading
 * from–to, money received, orders taken and the products in them.
 *
 * It opens already filled in from what the system knows about today
 * (GET /dsr/me/draft): the leads worked, orders taken, payments recorded
 * and the attendance meter readings. Every value stays editable; rows can
 * be added or removed before submitting.
 */

const MORE_TEXT_FIELDS = [
  { name: "nextDayPlan", label: "Next Day Plan" },
  { name: "issues", label: "Issues" },
  { name: "customerFeedback", label: "Customer Feedback" },
  { name: "competitorInfo", label: "Competitor Info" },
  { name: "remarks", label: "Remarks" },
];

let rowSequence = 0;
const nextRowId = () => {
  rowSequence += 1;
  return `visit-${rowSequence}`;
};

const numberField = (value) => (typeof value === "number" && value !== 0 ? String(value) : "");
const readingField = (value) => (typeof value === "number" ? String(value) : "");
const parseNumber = (value) => (String(value).trim() === "" ? undefined : Number(value));

const toRow = (visit = {}) => ({
  id: nextRowId(),
  retailerKey: visit.lead ? `lead:${visit.lead}` : visit.customer ? `customer:${visit.customer}` : "",
  lead: visit.lead ?? null,
  customer: visit.customer ?? null,
  retailerName: visit.retailerName ?? "",
  retailerPhone: visit.retailerPhone ?? "",
  retailerPlace: visit.retailerPlace ?? "",
  route: visit.route ?? "",
  meterFrom: readingField(visit.meterFrom),
  meterTo: readingField(visit.meterTo),
  amountReceived: numberField(visit.amountReceived),
  orders: (visit.orders ?? []).map(String),
  orderAmount: numberField(visit.orderAmount),
  products: (visit.products ?? []).map((line) => ({
    product: line.product ? String(line.product) : null,
    productName: line.productName,
    quantity: readingField(line.quantity),
    unit: line.unit ?? "",
  })),
});

const rowsFromDraft = (draft) =>
  draft?.visits?.length
    ? draft.visits.map(toRow)
    : [toRow({ meterFrom: draft?.attendance?.checkInMeterReading ?? undefined })];

/** Lines of several orders folded into one line per product. */
const mergeLines = (lines) => {
  const merged = new Map();
  for (const line of lines) {
    const key = line.product ? String(line.product) : `name:${line.productName}`;
    const existing = merged.get(key);
    if (existing) {
      existing.quantity = String((Number(existing.quantity) || 0) + (Number(line.quantity) || 0));
    } else {
      merged.set(key, {
        product: line.product ? String(line.product) : null,
        productName: line.productName,
        quantity: readingField(line.quantity),
        unit: line.unit ?? "",
      });
    }
  }
  return [...merged.values()];
};

const removeButton =
  "inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-red-700 ring-1 ring-red-200 transition hover:bg-red-50";

function VisitRow({ index, onChange, onRemove, options, row }) {
  const set = (patch) => onChange({ ...row, ...patch });

  const pickRetailer = (value) => {
    const option = options.retailers.find((item) => item.value === value);
    if (!option) {
      set({ retailerKey: "", lead: null, customer: null });
      return;
    }
    set({
      retailerKey: option.value,
      lead: option.lead ?? null,
      customer: option.customer ?? null,
      retailerName: option.name,
      retailerPhone: option.phone || row.retailerPhone,
      retailerPlace: option.place || "",
      route: row.route || option.place || "",
    });
  };

  // Picking orders fills the order amount and the products from them; the
  // employee can still change either afterwards.
  const pickOrders = (ids) => {
    const selected = options.orders.filter((order) => ids.includes(String(order._id)));
    const patch = {
      orders: ids,
      orderAmount: selected.length ? String(selected.reduce((sum, order) => sum + (order.grandTotal || 0), 0)) : "",
    };
    if (selected.length) patch.products = mergeLines(selected.flatMap((order) => order.items));
    if (!row.retailerName && selected[0]) {
      patch.retailerName = selected[0].customerName;
      patch.retailerPhone = row.retailerPhone || selected[0].customerPhone || "";
      patch.customer = selected[0].customer ?? null;
      patch.lead = selected[0].lead ?? null;
    }
    set(patch);
  };

  const pickProducts = (ids) => {
    const kept = row.products.filter((line) => !line.product || ids.includes(line.product));
    const added = ids
      .filter((id) => !kept.some((line) => line.product === id))
      .map((id) => {
        const product = options.productById.get(id);
        return { product: id, productName: product?.name || "Product", quantity: "", unit: product?.unit || "" };
      });
    set({ products: [...kept, ...added] });
  };

  const setQuantity = (lineIndex, quantity) =>
    set({ products: row.products.map((line, i) => (i === lineIndex ? { ...line, quantity } : line)) });

  const removeLine = (lineIndex) => set({ products: row.products.filter((_, i) => i !== lineIndex) });

  const from = parseNumber(row.meterFrom);
  const to = parseNumber(row.meterTo);
  const leg = typeof from === "number" && typeof to === "number" && to >= from ? to - from : null;

  return (
    <div className="rounded-xl border border-forest/15 bg-white p-4" data-visit-row={index + 1}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-black uppercase tracking-wide text-forest">Visit {index + 1}</h3>
        <button className={removeButton} onClick={onRemove} type="button">
          <Trash2 className="h-3.5 w-3.5" />
          Remove
        </button>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <SearchableSelect
            id={`${row.id}-retailer`}
            label="Pick lead / retailer"
            onChange={(event) => pickRetailer(event.target.value)}
            options={options.retailerSelect}
            placeholder="Search your leads…"
            value={row.retailerKey}
          />
        </div>
        <TextInput
          id={`${row.id}-name`}
          label="Retailer / lead name"
          onChange={(event) => set({ retailerName: event.target.value })}
          required
          value={row.retailerName}
        />
        <TextInput
          id={`${row.id}-phone`}
          inputMode="tel"
          label="Mobile number"
          maxLength={20}
          onChange={(event) => set({ retailerPhone: event.target.value })}
          value={row.retailerPhone}
        />

        <div className="sm:col-span-2">
          <TextInput
            id={`${row.id}-route`}
            label="Visit route (from – to)"
            onChange={(event) => set({ route: event.target.value })}
            placeholder="e.g. Indergarh – Dharavan"
            value={row.route}
          />
        </div>
        <TextInput
          id={`${row.id}-meter-from`}
          inputMode="decimal"
          label="Meter from (km)"
          min="0"
          onChange={(event) => set({ meterFrom: event.target.value })}
          step="any"
          type="number"
          value={row.meterFrom}
        />
        <TextInput
          error={typeof from === "number" && typeof to === "number" && to < from ? "Lower than 'from'" : ""}
          id={`${row.id}-meter-to`}
          inputMode="decimal"
          label={`Meter to (km)${leg !== null ? ` · ${leg} km` : ""}`}
          min="0"
          onChange={(event) => set({ meterTo: event.target.value })}
          step="any"
          type="number"
          value={row.meterTo}
        />

        <TextInput
          id={`${row.id}-received`}
          inputMode="decimal"
          label="Amount received (₹)"
          min="0"
          onChange={(event) => set({ amountReceived: event.target.value })}
          step="0.01"
          type="number"
          value={row.amountReceived}
        />
        <div className="sm:col-span-2">
          <SearchableMultiSelect
            id={`${row.id}-orders`}
            label="Orders received"
            onChange={(event) => pickOrders(event.target.value)}
            options={options.orderSelect}
            placeholder={options.orderSelect.length ? "Pick today's orders…" : "No orders taken today"}
            value={row.orders}
          />
        </div>
        <TextInput
          id={`${row.id}-order-amount`}
          inputMode="decimal"
          label="Order amount (₹)"
          min="0"
          onChange={(event) => set({ orderAmount: event.target.value })}
          step="0.01"
          type="number"
          value={row.orderAmount}
        />

        <div className="sm:col-span-2 lg:col-span-4">
          <SearchableMultiSelect
            id={`${row.id}-products`}
            label="Materials / products ordered"
            onChange={(event) => pickProducts(event.target.value)}
            options={options.productSelect}
            placeholder="Pick products…"
            value={row.products.filter((line) => line.product).map((line) => line.product)}
          />
          {row.products.length ? (
            <ul className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {row.products.map((line, lineIndex) => (
                <li
                  className="flex items-center gap-2 rounded-lg bg-mint/40 px-3 py-2"
                  key={`${line.product || line.productName}-${lineIndex}`}
                >
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink" title={line.productName}>
                    {line.productName}
                  </span>
                  <input
                    aria-label={`Quantity of ${line.productName}`}
                    className="w-20 rounded-md border border-forest/20 px-2 py-1 text-sm"
                    inputMode="decimal"
                    min="0"
                    onChange={(event) => setQuantity(lineIndex, event.target.value)}
                    placeholder="Qty"
                    step="any"
                    type="number"
                    value={line.quantity}
                  />
                  <span className="text-xs text-muted">{line.unit}</span>
                  <button
                    aria-label={`Remove ${line.productName}`}
                    className="rounded p-1 text-red-700 hover:bg-red-50"
                    onClick={() => removeLine(lineIndex)}
                    type="button"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/**
 * Shared between the Employee (FO) and Sales Manager (SO) portal submit
 * pages — both hold DSR_CREATE. A same-day resubmission surfaces the
 * backend's own specific 409 verbatim.
 */
export default function DSRSubmitForm({ onSuccess }) {
  const draftState = useMyDSRDraft();
  const draft = draftState.data;
  const [rows, setRows] = useState([]);
  const [notes, setNotes] = useState({ keyActivities: "", nextDayPlan: "", issues: "", customerFeedback: "", competitorInfo: "", remarks: "" });
  const [formError, setFormError] = useState("");
  const [showMore, setShowMore] = useState(false);
  const actions = useDSRActions({
    onSuccess: async (result) => {
      await draftState.refetch?.();
      await onSuccess?.(result);
    },
  });

  // Fill the rows from each draft the server returns: on first load, and
  // again when "Refill from today's activity" asks for a fresh one. After
  // a submit the refetched draft says alreadySubmitted, so nothing typed
  // is lost to it.
  useEffect(() => {
    if (draft) setRows(rowsFromDraft(draft));
  }, [draft]);

  const options = useMemo(() => {
    const retailers = draft?.retailerOptions ?? [];
    const orders = draft?.orderOptions ?? [];
    const products = draft?.productOptions ?? [];
    return {
      retailers,
      orders,
      productById: new Map(products.map((product) => [String(product._id), product])),
      retailerSelect: [
        { value: "", label: "— Not in my leads (type the name) —" },
        ...retailers.map((item) => ({
          value: item.value,
          label: [item.name, item.phone, item.place].filter(Boolean).join(" · "),
        })),
      ],
      orderSelect: orders.map((order) => ({
        value: String(order._id),
        label: `${order.orderNumber} · ${order.customerName} · ${formatMoney(order.grandTotal)}`,
      })),
      productSelect: products.map((product) => ({
        value: String(product._id),
        label: product.unit ? `${product.name} (${product.unit})` : product.name,
      })),
    };
  }, [draft]);

  const totals = useMemo(() => {
    let received = 0;
    let ordered = 0;
    let distance = 0;
    let legs = 0;
    for (const row of rows) {
      received += Number(row.amountReceived) || 0;
      ordered += Number(row.orderAmount) || 0;
      const from = parseNumber(row.meterFrom);
      const to = parseNumber(row.meterTo);
      if (typeof from === "number" && typeof to === "number" && to >= from) {
        distance += to - from;
        legs += 1;
      }
    }
    return { received, ordered, distance: legs ? Math.round(distance * 10) / 10 : null };
  }, [rows]);

  if (draftState.isLoading && !draft) {
    return <PageLoader message="Preparing today's report…" />;
  }
  if (draftState.isError && !draft) {
    return <ErrorState message={draftState.errorMessage} title="Unable to prepare today's DSR" />;
  }
  if (!draft) return null;

  const updateRow = (id, next) => setRows((current) => current.map((row) => (row.id === id ? next : row)));
  const removeRow = (id) => setRows((current) => current.filter((row) => row.id !== id));
  const addRow = () =>
    setRows((current) => {
      const previousTo = current.length ? current[current.length - 1].meterTo : "";
      return [...current, { ...toRow(), meterFrom: previousTo }];
    });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const visits = [];
    for (const [index, row] of rows.entries()) {
      const label = `Visit ${index + 1}`;
      if (!row.retailerName.trim()) {
        setFormError(`${label}: enter the retailer / lead name, or remove the row.`);
        return;
      }
      const numbers = {
        meterFrom: parseNumber(row.meterFrom),
        meterTo: parseNumber(row.meterTo),
        amountReceived: parseNumber(row.amountReceived),
        orderAmount: parseNumber(row.orderAmount),
      };
      if (Object.values(numbers).some((value) => value !== undefined && (!Number.isFinite(value) || value < 0))) {
        setFormError(`${label}: numbers must be valid and not negative.`);
        return;
      }
      if (typeof numbers.meterFrom === "number" && typeof numbers.meterTo === "number" && numbers.meterTo < numbers.meterFrom) {
        setFormError(`${label}: meter 'to' reading cannot be lower than 'from'.`);
        return;
      }
      visits.push({
        route: row.route.trim(),
        lead: row.lead,
        customer: row.customer,
        retailerName: row.retailerName.trim(),
        retailerPhone: row.retailerPhone.trim(),
        retailerPlace: row.retailerPlace.trim(),
        amountReceived: numbers.amountReceived ?? 0,
        orders: row.orders,
        orderAmount: numbers.orderAmount ?? 0,
        products: row.products.map((line) => {
          const quantity = parseNumber(line.quantity);
          return {
            product: line.product,
            productName: line.productName,
            quantity: Number.isFinite(quantity) && quantity >= 0 ? quantity : null,
            unit: line.unit,
          };
        }),
        meterFrom: numbers.meterFrom ?? null,
        meterTo: numbers.meterTo ?? null,
      });
    }

    const payload = { visits, newLeadsGenerated: draft.summary?.newLeads ?? 0 };
    for (const [name, value] of Object.entries(notes)) {
      if (value.trim()) payload[name] = value.trim();
    }

    try {
      await actions.submitDSR.mutate(payload);
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  const dateLabel = new Date(draft.date).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (draft.alreadySubmitted) {
    return (
      <Card className="p-6 text-center">
        <p className="text-lg font-black text-ink">Today's DSR is submitted</p>
        <p className="mt-2 text-sm text-muted">
          {dateLabel} · You can see it under your DSRs. A new report opens tomorrow.
        </p>
      </Card>
    );
  }

  const summary = draft.summary ?? {};

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <Card className="p-5">
        <div className="text-center">
          <p className="text-lg font-black text-forest">K N Agro &amp; Bio Fertilizers Pvt. Ltd.</p>
          <p className="text-xs text-muted">Dharavan, Inderagarh, Bundi, Rajasthan - 323613</p>
          <p className="mt-1 text-base font-black text-red-600">Daily Sales Report</p>
        </div>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-lg bg-mint/30 px-3 py-2">
            <dt className="text-xs font-black uppercase tracking-wide text-muted">Name of employee</dt>
            <dd className="mt-1 font-bold text-ink">{draft.employee?.name}</dd>
          </div>
          <div className="rounded-lg bg-mint/30 px-3 py-2">
            <dt className="text-xs font-black uppercase tracking-wide text-muted">Designation</dt>
            <dd className="mt-1 font-bold text-ink">
              {draft.employee?.designation || String(draft.employee?.role || "").toUpperCase() || "—"}
            </dd>
          </div>
          <div className="rounded-lg bg-mint/30 px-3 py-2">
            <dt className="text-xs font-black uppercase tracking-wide text-muted">Date</dt>
            <dd className="mt-1 font-bold text-ink">{dateLabel}</dd>
          </div>
        </dl>
        <p className="mt-4 rounded-lg border border-forest/10 bg-white px-3 py-2 text-xs text-muted" data-autofill-summary>
          Filled in from today: <b className="text-ink">{summary.visits ?? 0}</b> visit(s),{" "}
          <b className="text-ink">{summary.orders ?? 0}</b> order(s),{" "}
          <b className="text-ink">{formatMoney(summary.amountReceived ?? 0)}</b> received
          {typeof draft.attendance?.checkInMeterReading === "number"
            ? ` · meter at check-in ${draft.attendance.checkInMeterReading} km`
            : ""}
          {typeof draft.attendance?.checkOutMeterReading === "number"
            ? `, at check-out ${draft.attendance.checkOutMeterReading} km`
            : ""}
          . Check everything and change what is wrong.
        </p>
      </Card>

      <div className="space-y-3">
        {rows.map((row, index) => (
          <VisitRow
            index={index}
            key={row.id}
            onChange={(next) => updateRow(row.id, next)}
            onRemove={() => removeRow(row.id)}
            options={options}
            row={row}
          />
        ))}
        <div className="flex flex-wrap gap-3">
          <button
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint"
            onClick={addRow}
            type="button"
          >
            <Plus className="h-4 w-4" />
            Add visit
          </button>
          <button
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-muted ring-1 ring-forest/10 transition hover:bg-mint"
            onClick={() => draftState.refetch?.()}
            type="button"
          >
            <RefreshCw className="h-4 w-4" />
            Refill from today's activity
          </button>
        </div>
      </div>

      <Card className="p-5">
        <dl className="grid gap-3 text-sm sm:grid-cols-3" data-dsr-totals>
          <div>
            <dt className="text-xs font-black uppercase tracking-wide text-muted">Total amount received</dt>
            <dd className="mt-1 text-lg font-black text-ink">{formatMoney(totals.received)}</dd>
          </div>
          <div>
            <dt className="text-xs font-black uppercase tracking-wide text-muted">Total order value</dt>
            <dd className="mt-1 text-lg font-black text-ink">{formatMoney(totals.ordered)}</dd>
          </div>
          <div>
            <dt className="text-xs font-black uppercase tracking-wide text-muted">Distance travelled</dt>
            <dd className="mt-1 text-lg font-black text-ink">{totals.distance !== null ? `${totals.distance} km` : "—"}</dd>
          </div>
        </dl>

        <div className="mt-4">
          <Textarea
            id="dsr-keyActivities"
            label="What you did today"
            maxLength={2000}
            onChange={(event) => setNotes((prev) => ({ ...prev, keyActivities: event.target.value }))}
            value={notes.keyActivities}
          />
        </div>

        <button
          aria-expanded={showMore}
          className="mt-4 flex w-full items-center justify-between gap-3 text-left"
          onClick={() => setShowMore((open) => !open)}
          type="button"
        >
          <span className="text-sm font-black text-ink">More notes (optional)</span>
          {showMore ? <ChevronUp className="h-5 w-5 text-forest" /> : <ChevronDown className="h-5 w-5 text-forest" />}
        </button>
        {showMore ? (
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {MORE_TEXT_FIELDS.map((field) => (
              <Textarea
                id={`dsr-${field.name}`}
                key={field.name}
                label={field.label}
                maxLength={2000}
                onChange={(event) => setNotes((prev) => ({ ...prev, [field.name]: event.target.value }))}
                value={notes[field.name]}
              />
            ))}
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
          {actions.submitDSR.isLoading ? "Submitting..." : "Submit today's DSR"}
        </button>
      </div>
    </form>
  );
}
