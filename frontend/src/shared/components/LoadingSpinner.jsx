export default function LoadingSpinner({ className = "h-6 w-6", label = "Loading" }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm font-semibold text-forest" role="status">
      <span
        aria-hidden="true"
        className={`inline-block animate-spin rounded-full border-4 border-mint border-t-agriculture ${className}`}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

