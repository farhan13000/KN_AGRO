import { PERMISSIONS } from "../../../shared/constants";
import TabbedWorkspace from "../../../shared/components/TabbedWorkspace";
import SuperAdminInventoryOverviewPage from "./SuperAdminInventoryOverviewPage";
import SuperAdminLowStockPage from "./SuperAdminLowStockPage";
import SuperAdminOutOfStockPage from "./SuperAdminOutOfStockPage";
import SuperAdminInventoryTransactionsPage from "./SuperAdminInventoryTransactionsPage";

/**
 * Stock levels and the movements behind them.
 *
 * Low stock and out of stock are not separate subjects -- they are the same
 * list under a threshold, and they sat three sidebar entries away from the
 * ledger that explains how they got there.
 */
const TABS = [
  {
    id: "levels",
    label: "Stock levels",
    permission: PERMISSIONS.INVENTORY_READ,
    blurb: "Stock, reserved quantities and reorder thresholds per product.",
    render: () => <SuperAdminInventoryOverviewPage showHeading={false} />,
  },
  {
    id: "low",
    label: "Low stock",
    permission: PERMISSIONS.INVENTORY_READ,
    blurb: "Products at or below their backend-defined minimum threshold.",
    render: () => <SuperAdminLowStockPage showHeading={false} />,
  },
  {
    id: "out",
    label: "Out of stock",
    permission: PERMISSIONS.INVENTORY_READ,
    blurb: "Products with no available stock left to sell.",
    render: () => <SuperAdminOutOfStockPage showHeading={false} />,
  },
  {
    id: "movements",
    label: "Movements",
    permission: PERMISSIONS.INVENTORY_TRANSACTIONS_READ,
    blurb: "The immutable stock ledger, newest movement first.",
    render: () => <SuperAdminInventoryTransactionsPage showHeading={false} />,
  },
];

export default function SuperAdminStockPage() {
  return (
    <TabbedWorkspace
      description="Stock levels, shortages, and the movements behind them."
      emptyDescription="You do not have permission to view inventory."
      emptyTitle="No inventory access"
      eyebrow="Inventory Control"
      tabs={TABS}
      title="Inventory"
    />
  );
}
