import { useState } from "react";
import { DSRSubmitForm } from "../../../features/dsr";

/**
 * The Office Admin's own Daily Sales Report.
 *
 * OA sits outside the sales chain — there is no manager above it — so
 * this report goes to the Super Admin, the same escalation the backend
 * already uses for a GM's own DSR (see DSRService.submitDSR).
 */
export default function SuperAdminDSRSubmitPage() {
  const [message, setMessage] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">My Work</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Submit Daily Sales Report</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          One DSR per day — submitting again today will be rejected until tomorrow. This report goes to the Super
          Admin for review.
        </p>
      </div>

      {message ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-800">
          {message}
        </p>
      ) : null}

      <DSRSubmitForm onSuccess={() => setMessage("DSR submitted successfully.")} />
    </div>
  );
}
