import Card from "../../../shared/components/Card";
import { getProductUnitLabel } from "../../products/utils";
import StockStatusBadge from "./StockStatusBadge";

const formatDateTime = (value) => {
  if (!value) return "No movement yet";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "No movement yet";
  return parsed.toLocaleString();
};

export default function InventorySummaryGrid({ inventory, product }) {
  const unit = getProductUnitLabel(product?.unit);
  const cards = [
    { label: "Current Stock", value: `${inventory?.currentStock ?? 0} ${unit}` },
    { label: "Reserved Stock", value: `${inventory?.reservedStock ?? 0} ${unit}` },
    { label: "Available Stock", value: `${inventory?.availableStock ?? 0} ${unit}` },
    { label: "Minimum Stock", value: `${inventory?.minimumStock ?? 0} ${unit}` },
    { label: "Last Movement", value: formatDateTime(inventory?.lastStockMovementAt) },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <Card className="p-5" key={card.label}>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-muted">{card.label}</p>
          <p className="mt-2 text-xl font-black text-ink">{card.value}</p>
        </Card>
      ))}
      <Card className="p-5">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-muted">Stock Status</p>
        <div className="mt-3">
          <StockStatusBadge
            availableStock={inventory?.availableStock}
            minimumStock={inventory?.minimumStock}
            status={inventory?.stockStatus}
          />
        </div>
      </Card>
    </div>
  );
}
