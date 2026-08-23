import { formatSpecifications } from "../utils";

export default function SpecificationsDisplay({
  emptyMessage = "No specifications provided.",
  specifications,
  title = "Specifications",
}) {
  const items = formatSpecifications(specifications);

  return (
    <section aria-labelledby="product-specifications-title">
      <h3 id="product-specifications-title" className="text-lg font-extrabold text-ink">
        {title}
      </h3>
      {items.length ? (
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {items.map(([key, value]) => (
            <div className="rounded-lg border border-forest/10 bg-white px-4 py-3" key={key}>
              <dt className="text-xs font-black uppercase tracking-[0.12em] text-muted">{key}</dt>
              <dd className="mt-1 text-sm font-semibold leading-6 text-ink">{String(value)}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-3 rounded-lg border border-forest/10 bg-mint px-4 py-3 text-sm font-semibold text-muted">
          {emptyMessage}
        </p>
      )}
    </section>
  );
}
