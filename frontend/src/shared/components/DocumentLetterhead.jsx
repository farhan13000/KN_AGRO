import logo from "../../assets/KN_AGRO_LOGO.png";

/**
 * The letterhead at the top of every outgoing document — quotation,
 * invoice, order copy.
 *
 * These are the only things this business sends a customer that the
 * customer keeps, so they are the company's face on paper. Three of
 * them had grown their own near-identical header, and the order copy
 * had quietly fallen behind with a hardcoded name and no address at
 * all. One component now, so a change to the letterhead is a change in
 * one place and no document can drift again.
 *
 * DEGRADES BY DESIGN. Everything except the company name is optional —
 * address, phone, email and GSTIN come from the backend's COMPANY_*
 * settings and may not be filled in yet. Each line simply does not
 * render when its value is missing, so a half-configured company still
 * produces a clean, deliberate-looking header rather than blank gaps
 * or the word "undefined".
 *
 * The logo is an `<img>` with print-color-adjust, the same technique
 * PrintWatermark already proved: browsers drop CSS background images
 * from printouts, and an invoice must not depend on the reader having
 * found the "Background graphics" checkbox.
 */
export default function DocumentLetterhead({ company, documentNumber, meta = [], status = null, title }) {
  const contactLine = [company?.phone, company?.email].filter(Boolean).join("  ·  ");

  return (
    <header className="border-b-[3px] border-forest pb-5">
      <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-5">
        <div className="flex min-w-0 items-start gap-4">
          <img
            alt=""
            aria-hidden="true"
            className="h-16 w-16 shrink-0 object-contain"
            src={logo}
            style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}
          />
          <div className="min-w-0">
            {/* Serif for the legal entity name — the same face the DSR
                sheet uses, so the two printed documents read as coming
                from one company. */}
            <p
              className="text-xl font-bold leading-tight text-forest"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              {company?.name || "K N Agro & Bio Fertilizers Pvt. Ltd."}
            </p>
            {company?.address ? (
              <p className="mt-1 max-w-xs whitespace-pre-line text-xs leading-relaxed text-muted">{company.address}</p>
            ) : null}
            {contactLine ? <p className="mt-1 text-xs text-muted">{contactLine}</p> : null}
            {company?.gstin ? (
              <p className="mt-1 text-xs font-semibold text-muted">GSTIN: {company.gstin}</p>
            ) : null}
          </div>
        </div>

        <div className="ml-auto text-right">
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-muted">{title}</p>
          <p className="mt-0.5 text-2xl font-black leading-tight text-ink">{documentNumber}</p>

          {/* A label/value grid rather than sentences: a reader scanning
              for the due date finds it in the same place on every
              document, which is the whole point of a form. */}
          {meta.length ? (
            <dl className="mt-3 space-y-1 text-xs">
              {meta.map(({ label, value }) => (
                <div className="flex justify-end gap-3" key={label}>
                  <dt className="text-muted">{label}</dt>
                  <dd className="min-w-[7.5rem] text-left font-semibold text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {status ? <div className="mt-3 flex justify-end">{status}</div> : null}
        </div>
      </div>
    </header>
  );
}
