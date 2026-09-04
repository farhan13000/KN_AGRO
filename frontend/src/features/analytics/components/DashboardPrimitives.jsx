import Card from "../../../shared/components/Card";
import { formatMoney } from "../../../shared/utils";

export const StatGrid = ({ children }) => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
);

export const Stat = ({ label, money = false, value }) => (
  <div className="rounded-lg border border-forest/10 bg-white p-4 shadow-sm">
    <p className="text-xs font-black uppercase tracking-wide text-muted">{label}</p>
    <p className="mt-1 text-2xl font-black text-ink">{money ? formatMoney(value) : (value ?? 0)}</p>
  </div>
);

export const Section = ({ children, title }) => (
  <Card className="p-5">
    <h2 className="text-lg font-black text-ink">{title}</h2>
    <div className="mt-4">{children}</div>
  </Card>
);

export const KeyValueRow = ({ label, value }) => (
  <div className="flex items-center justify-between rounded-lg border border-forest/10 px-4 py-2 text-sm">
    <span className="font-semibold text-ink">{label}</span>
    <span className="font-bold text-forest">{value}</span>
  </div>
);
