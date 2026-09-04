import { useState } from "react";
import { DSRSubmitForm } from "../../../features/dsr";

export default function EmployeeDSRSubmitPage() {
  const [message, setMessage] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">Employee</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Submit Daily Sales Report</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          One DSR per day — submitting again today will be rejected until tomorrow.
        </p>
      </div>

      {message ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-800">{message}</p>
      ) : null}

      <DSRSubmitForm onSuccess={() => setMessage("DSR submitted successfully.")} />
    </div>
  );
}
