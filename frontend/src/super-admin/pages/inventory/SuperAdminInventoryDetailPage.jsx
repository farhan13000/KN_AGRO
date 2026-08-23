import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  History,
  PackageOpen,
  PlusCircle,
  SlidersHorizontal,
} from "lucide-react";
import Button from "../../../shared/components/Button";
import Card from "../../../shared/components/Card";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import Modal from "../../../shared/components/Modal";
import PageLoader from "../../../shared/components/PageLoader";
import { getApiErrorMessage } from "../../../core/api";
import { PERMISSIONS, ROUTES } from "../../../shared/constants";
import { useAuth } from "../../../core/auth";
import {
  InventoryMovementForm,
  InventorySummaryGrid,
  InventoryTransactionTable,
  initialInventoryMovementValues,
  pickInventoryMovementPayload,
  useInventoryActions,
  useInventoryDetail,
  useProductInventoryTransactions,
  validateInventoryMovementForm,
} from "../../../features/inventory";

const STOCK_CONFLICT_MESSAGE =
  "Stock has changed. Please review the latest inventory and try again.";

export default function SuperAdminInventoryDetailPage() {
  const { productId } = useParams();
  const { hasPermission } = useAuth();
  const [activeAction, setActiveAction] = useState(null);
  const [movementValues, setMovementValues] = useState(initialInventoryMovementValues);
  const [movementErrors, setMovementErrors] = useState({});
  const [movementWarning, setMovementWarning] = useState("");
  const [movementError, setMovementError] = useState("");
  const inventoryState = useInventoryDetail(productId);
  const transactionState = useProductInventoryTransactions(productId, { limit: 5 });
  const product = inventoryState.data?.product || inventoryState.data?.inventory?.product;
  const inventory = inventoryState.data?.inventory;
  const latestTransaction = inventoryState.data?.latestTransaction;
  const transactions = transactionState.data?.transactions || (latestTransaction ? [latestTransaction] : []);
  const canStockIn = hasPermission(PERMISSIONS.INVENTORY_STOCK_IN);
  const canStockOut = hasPermission(PERMISSIONS.INVENTORY_STOCK_OUT);
  const canAdjust = hasPermission(PERMISSIONS.INVENTORY_ADJUST);
  const canManage = hasPermission(PERMISSIONS.INVENTORY_MANAGE);
  const actionButtons = [
    {
      description: "Record the one-time initial stock balance. The backend rejects this if opening stock is no longer valid.",
      icon: PlusCircle,
      key: "opening",
      label: "Opening Stock",
      mutation: "createOpeningStock",
      permitted: canManage,
      submitLabel: "Record Opening Stock",
    },
    {
      description: "Record received stock. Backend calculates the authoritative resulting stock.",
      icon: ArrowUpCircle,
      key: "stockIn",
      label: "Stock In",
      mutation: "stockIn",
      permitted: canStockIn,
      submitLabel: "Record Stock In",
    },
    {
      description: "Record stock leaving inventory. The backend enforces sufficient available stock.",
      icon: ArrowDownCircle,
      key: "stockOut",
      label: "Stock Out",
      mutation: "stockOut",
      permitted: canStockOut,
      submitLabel: "Record Stock Out",
    },
    {
      description: "Increase stock through an audited adjustment transaction.",
      icon: SlidersHorizontal,
      key: "adjustIn",
      label: "Adjustment In",
      mutation: "adjustStockIn",
      permitted: canAdjust,
      submitLabel: "Record Adjustment In",
    },
    {
      blockWhenAboveAvailable: true,
      description: "Decrease stock through an audited adjustment transaction. This form blocks obvious negative-stock requests.",
      icon: SlidersHorizontal,
      key: "adjustOut",
      label: "Adjustment Out",
      mutation: "adjustStockOut",
      permitted: canAdjust,
      submitLabel: "Record Adjustment Out",
    },
    {
      description: "Record damaged stock as an inventory transaction. The backend enforces sufficient available stock.",
      icon: AlertTriangle,
      key: "damaged",
      label: "Damaged Stock",
      mutation: "markDamagedStock",
      permitted: canAdjust,
      submitLabel: "Record Damaged Stock",
    },
  ];
  const inventoryActions = useInventoryActions({
    onSuccess: () => {
      setActiveAction(null);
      setMovementValues(initialInventoryMovementValues);
      setMovementErrors({});
      setMovementWarning("");
      setMovementError("");
    },
    refetchInventory: inventoryState.refetch,
    refetchTransactions: transactionState.refetch,
  });

  const openAction = (action) => {
    setActiveAction(action);
    setMovementValues(initialInventoryMovementValues);
    setMovementErrors({});
    setMovementWarning("");
    setMovementError("");
  };

  const closeAction = () => {
    setActiveAction(null);
    setMovementError("");
  };

  const handleMovementChange = (event) => {
    setMovementValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleMovementSubmit = async (event) => {
    event.preventDefault();
    if (!activeAction) return;

    const validation = validateInventoryMovementForm(movementValues, {
      availableStock: inventory?.availableStock,
      blockWhenAboveAvailable: activeAction.blockWhenAboveAvailable,
    });
    setMovementErrors(validation.errors);
    setMovementWarning(validation.warnings.quantity || "");
    setMovementError("");
    if (!validation.isValid) return;

    try {
      await inventoryActions[activeAction.mutation].mutate(
        productId,
        pickInventoryMovementPayload(movementValues),
      );
    } catch (error) {
      if (error?.status === 409) {
        inventoryState.refetch();
        transactionState.refetch();
        setMovementError(STOCK_CONFLICT_MESSAGE);
        return;
      }
      setMovementError(getApiErrorMessage(error));
    }
  };

  if (inventoryState.isLoading) return <PageLoader message="Loading inventory detail..." />;
  if (inventoryState.isError) {
    return <ErrorState message={inventoryState.errorMessage} title="Unable to load inventory detail" />;
  }
  if (!product || !inventory) {
    return (
      <EmptyState
        actionLabel="Back To Inventory"
        actionTo={ROUTES.SUPER_ADMIN.INVENTORY}
        description="The selected product inventory record could not be found."
        title="Inventory record not found"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">Inventory Control</p>
          <h1 className="mt-2 text-3xl font-black text-ink">{product.name}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            {product.productCode || inventory.productCode || "Product code pending"} | {product.category?.name || "Uncategorized"}
          </p>
        </div>
        <Link
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint"
          to={`${ROUTES.SUPER_ADMIN.PRODUCTS}/${product._id}`}
        >
          <PackageOpen className="h-4 w-4" />
          Product Detail
        </Link>
      </div>

      <InventorySummaryGrid inventory={inventory} product={product} />

      <Card className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-black text-ink">Stock Actions</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Manual actions create immutable stock transactions. Reserved, released, and sale movements are
              system-driven and are intentionally not exposed as manual Phase 3 buttons.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {actionButtons
              .filter((action) => action.permitted)
              .map((action) => {
                const ActionIcon = action.icon;
                return (
                  <Button key={action.label} onClick={() => openAction(action)} variant="secondary">
                    <ActionIcon className="h-4 w-4" />
                    {action.label}
                  </Button>
                );
              })}
          </div>
          {!actionButtons.some((action) => action.permitted) ? (
            <p className="text-sm font-semibold text-muted">No stock actions are available for your permissions.</p>
          ) : null}
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-ink">Recent Transactions</h2>
            <p className="mt-1 text-sm text-muted">Latest stock movement records for this product.</p>
          </div>
          <Link
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint"
            to={`${ROUTES.SUPER_ADMIN.INVENTORY_TRANSACTIONS}?product=${product._id}`}
          >
            <History className="h-4 w-4" />
            Full History
          </Link>
        </div>

        {transactionState.isError ? (
          <ErrorState message={transactionState.errorMessage} title="Unable to load transactions" />
        ) : null}
        {!transactionState.isError && !transactions.length ? (
          <p className="mt-4 rounded-lg border border-forest/10 bg-mint px-4 py-3 text-sm font-semibold text-muted">
            No stock transactions recorded yet.
          </p>
        ) : null}
        {!transactionState.isError && transactions.length ? (
          <div className="mt-4">
            <InventoryTransactionTable transactions={transactions} />
          </div>
        ) : null}
      </Card>

      <Modal isOpen={Boolean(activeAction)} onClose={closeAction} title={activeAction?.label || "Stock Action"}>
        <div className="space-y-4">
          <p className="text-sm leading-6 text-muted">{activeAction?.description}</p>
          {movementError ? <ErrorState message={movementError} title="Unable to save stock movement" /> : null}
          <InventoryMovementForm
            errors={movementErrors}
            isSubmitting={activeAction ? inventoryActions[activeAction.mutation].isLoading : false}
            onCancel={closeAction}
            onChange={handleMovementChange}
            onSubmit={handleMovementSubmit}
            submitLabel={activeAction?.submitLabel}
            values={movementValues}
            warning={movementWarning}
          />
        </div>
      </Modal>
    </div>
  );
}
