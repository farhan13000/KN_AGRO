import PrintWatermark from "../../../shared/components/PrintWatermark";
import { formatMoney } from "../../../shared/utils";

/**
 * A submitted DSR drawn as the company's paper "Daily Sales Report" sheet:
 * letterhead, Name of Employee / Designation box, and the ruled table —
 * Date, Visit Route, Retailer Details, Amount Received, Order Received,
 * Materials Order Details — plus the Meter Reading column added by hand on
 * the paper form, then "Employee Sign".
 *
 * Printed landscape on A4; the browser's "Save as PDF" turns it into the
 * PDF (same approach as invoices/quotations — no PDF library).
 */

const MIN_ROWS = 12;

const reading = (value) => (typeof value === "number" ? value : "");

const formatDay = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "2-digit", year: "numeric" })
    : "";

const cell = "border border-slate-500 px-1.5 py-1 align-top";
const head = "border border-slate-500 px-1.5 py-1.5 text-center font-semibold";

export default function DSRPrintView({ dsr }) {
  const visits = dsr.visits ?? [];
  const blankRows = Math.max(MIN_ROWS - visits.length, 0);
  const employeeName = dsr.employee?.user?.name || dsr.employee?.employeeCode || "";
  const day = formatDay(dsr.date);

  const totalReceived = visits.reduce((sum, visit) => sum + (visit.amountReceived || 0), 0);
  const totalOrdered = visits.reduce((sum, visit) => sum + (visit.orderAmount || 0), 0);

  return (
    <div className="dsr-sheet relative mx-auto overflow-hidden bg-white p-6 text-[11px] leading-snug text-slate-900 shadow-sm print:p-0 print:shadow-none">
      <style>{`
        @page { size: A4 landscape; margin: 10mm; }
        @media print {
          html, body { background: #fff !important; }
          .dsr-sheet { width: 100%; }
          .dsr-sheet table { page-break-inside: auto; }
          .dsr-sheet tr { page-break-inside: avoid; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      {/* Faint logo behind the table, like the printed sheet. */}
      <PrintWatermark className="w-[45%]" />

      <div className="relative">
        <header className="text-center">
          <h1 className="text-2xl font-bold text-[#1f3b8a]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            K N Agro &amp; Bio Fertilizers Pvt. Ltd.
          </h1>
          <p className="text-[13px] font-semibold text-slate-800">Dharavan, Inderagarh, Bundi, Rajashtan - 323613</p>
          <p className="mt-3 text-[15px] font-bold text-[#e0452b]">Daily Sales Report</p>
        </header>

        <table className="mt-3 w-full border-collapse text-[12px] md:w-[62%]">
          <tbody>
            <tr>
              <td className={`${cell} w-40 font-semibold`}>Name of Employee</td>
              <td className={cell}>{employeeName}</td>
            </tr>
            <tr>
              <td className={`${cell} font-semibold`}>Designation</td>
              <td className={cell}>{dsr.employee?.designation || ""}</td>
            </tr>
          </tbody>
        </table>

        <table className="doc-table mt-4 w-full border-collapse" data-dsr-print-table>
          <thead>
            <tr>
              <th className={`${head} w-[8%]`}>Date</th>
              <th className={`${head} w-[14%]`}>Visit Route</th>
              <th className={`${head} w-[20%]`}>Retailer Details</th>
              <th className={`${head} w-[10%]`}>
                Amount
                <br />
                Received
              </th>
              <th className={`${head} w-[12%]`}>Order Received</th>
              <th className={`${head} w-[22%]`}>
                Materials Order
                <br />
                Details
              </th>
              <th className={`${head} w-[14%]`}>
                Meter Reading
                <br />
                <span className="font-normal">From – To</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {visits.map((visit, index) => (
              <tr key={`${visit.retailerName}-${index}`}>
                <td className={`${cell} whitespace-nowrap`}>
                  <span className="doc-label">Date</span>
                  {index === 0 ? day : ""}
                </td>
                <td className={cell}>
                  <span className="doc-label">Visit route</span>
                  {visit.route}
                </td>
                <td className={`${cell} doc-cell-title`}>
                  <span className="block font-semibold">{visit.retailerName}</span>
                  {visit.retailerPhone ? <span className="block">Mob: {visit.retailerPhone}</span> : null}
                  {visit.retailerPlace ? <span className="block text-slate-600">{visit.retailerPlace}</span> : null}
                </td>
                <td className={`${cell} text-right`}>
                  <span className="doc-label">Amount received</span>
                  {visit.amountReceived ? formatMoney(visit.amountReceived) : ""}
                </td>
                <td className={cell}>
                  <span className="doc-label">Order received</span>
                  <span className="block">
                  {visit.orderAmount ? <span className="block text-right font-semibold">{formatMoney(visit.orderAmount)}</span> : null}
                  {visit.orderNumbers?.length ? (
                    <span className="block text-[10px] text-slate-600">{visit.orderNumbers.join(", ")}</span>
                  ) : null}
                  </span>
                </td>
                <td className={cell}>
                  <span className="doc-label">Materials ordered</span>
                  <span className="block">
                  {(visit.products ?? []).map((line, lineIndex) => (
                    <span className="block" key={`${line.productName}-${lineIndex}`}>
                      {line.productName}
                      {typeof line.quantity === "number" ? ` – ${line.quantity}${line.unit ? ` ${line.unit}` : ""}` : ""}
                    </span>
                  ))}
                  </span>
                </td>
                <td className={`${cell} whitespace-nowrap text-center`}>
                  <span className="doc-label">Meter reading</span>
                  <span className="block">
                  {typeof visit.meterFrom === "number" || typeof visit.meterTo === "number"
                    ? `${reading(visit.meterFrom)} – ${reading(visit.meterTo)}`
                    : ""}
                  {typeof visit.meterFrom === "number" && typeof visit.meterTo === "number" ? (
                    <span className="block text-[10px] text-slate-600">
                      {Math.round((visit.meterTo - visit.meterFrom) * 10) / 10} km
                    </span>
                  ) : null}
                  </span>
                </td>
              </tr>
            ))}
            {/* Ruled empty lines so the printed sheet fills the page. On
                a phone there is no page to fill, and an empty card says
                nothing, so they are left off the screen only. */}
            {Array.from({ length: blankRows }, (_, index) => (
              <tr className="doc-blank-row h-6" key={`blank-${index}`}>
                {Array.from({ length: 7 }, (__, column) => (
                  <td className={cell} key={column}>
                    {visits.length === 0 && index === 0 && column === 0 ? day : ""}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="font-semibold">
              <td className={`${cell} doc-cell-title`} colSpan={3}>
                Total
              </td>
              <td className={`${cell} text-right`}>
                <span className="doc-label">Amount received</span>
                {formatMoney(totalReceived)}
              </td>
              <td className={`${cell} text-right`}>
                <span className="doc-label">Order received</span>
                {formatMoney(totalOrdered)}
              </td>
              <td className={`${cell} doc-blank-row`} />
              <td className={`${cell} text-center`}>
                <span className="doc-label">Distance</span>
                {typeof dsr.distanceKm === "number" ? `${dsr.distanceKm} km` : ""}
              </td>
            </tr>
          </tbody>
        </table>

        {dsr.keyActivities ? (
          <p className="mt-2 text-[11px]">
            <span className="font-semibold">Remarks: </span>
            {dsr.keyActivities}
          </p>
        ) : null}

        <div className="mt-8 flex items-end justify-between text-[12px]">
          <p className="font-semibold">
            Employee Sign : <span className="inline-block w-48 border-b border-slate-500" />
          </p>
          <p className="text-[10px] text-slate-500">
            Submitted on the app{dsr.createdAt ? ` · ${new Date(dsr.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}` : ""}
            {dsr.status ? ` · ${dsr.status}` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
