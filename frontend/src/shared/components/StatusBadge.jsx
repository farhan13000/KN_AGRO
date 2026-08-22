const toneClasses = {
  success: "bg-green-50 text-green-800 ring-green-200",
  warning: "bg-yellow-50 text-yellow-900 ring-yellow-200",
  danger: "bg-red-50 text-red-800 ring-red-200",
  neutral: "bg-mint text-forest ring-forest/10",
};

export default function StatusBadge({ children, tone = "neutral" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${
        toneClasses[tone] || toneClasses.neutral
      }`}
    >
      {children}
    </span>
  );
}

