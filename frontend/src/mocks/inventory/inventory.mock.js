import { simulateNetwork } from "../../utils/mockApi";
import {
  INVENTORY_TRANSACTION_TYPE,
  STOCK_STATUS,
} from "../../features/inventory/constants";
import { PRODUCT_STATUS, PRODUCT_UNIT } from "../../features/products/constants";

const now = "2026-08-23T00:00:00.000Z";
const productId = "66f000000000000000000201";

const product = {
  _id: productId,
  productCode: "PRD-0001",
  name: "KN Bio Growth",
  category: {
    _id: "66f000000000000000000101",
    name: "Bio Fertilizers",
    slug: "bio-fertilizers",
  },
  unit: PRODUCT_UNIT.KG,
  status: PRODUCT_STATUS.ACTIVE,
};

const inventory = {
  product,
  currentStock: 70,
  reservedStock: 5,
  availableStock: 65,
  minimumStock: 20,
  location: null,
  lastStockMovementAt: now,
  stockStatus: STOCK_STATUS.IN_STOCK,
};

const transaction = {
  _id: "66f000000000000000000301",
  transactionCode: "TXN-0001",
  product,
  type: INVENTORY_TRANSACTION_TYPE.OPENING_STOCK,
  quantity: 70,
  previousStock: 0,
  newStock: 70,
  previousReservedStock: 0,
  newReservedStock: 0,
  referenceType: "MANUAL",
  referenceId: null,
  reason: "Opening balance",
  remarks: "",
  performedBy: {
    _id: "66f000000000000000000401",
    name: "Super Admin",
  },
  createdAt: now,
};

const pagination = {
  page: 1,
  limit: 10,
  total: 1,
  pages: 1,
};

const mutationResult = (type, quantity, reason, remarks) =>
  simulateNetwork({
    inventory,
    transaction: {
      ...transaction,
      _id: "66f000000000000000000399",
      transactionCode: "TXN-0002",
      type,
      quantity,
      reason,
      remarks: remarks || "",
    },
  });

export const mockInventoryApi = {
  getInventory: () => simulateNetwork({ items: [inventory], pagination }),
  getInventoryByProduct: () => simulateNetwork({ product, inventory, latestTransaction: transaction }),
  getTransactions: () => simulateNetwork({ transactions: [transaction], pagination }),
  getProductTransactions: () => simulateNetwork({ transactions: [transaction], pagination }),
  getLowStock: () => simulateNetwork({ items: [], pagination: { ...pagination, total: 0, pages: 0 } }),
  getOutOfStock: () => simulateNetwork({ items: [], pagination: { ...pagination, total: 0, pages: 0 } }),
  getInventorySummary: () =>
    simulateNetwork({
      totalItems: 1,
      lowStockItems: 0,
      outOfStockItems: 0,
      totalAvailableStock: inventory.availableStock,
    }),
  getMovementsReport: () =>
    simulateNetwork({
      transactions: [transaction],
      pagination,
      summary: { totalStockIn: 70, totalStockOut: 0, netMovement: 70 },
    }),
  getValuationReport: () =>
    simulateNetwork({
      items: [],
      pagination,
      summary: { totalCostValue: 0, totalListValue: 0 },
    }),
  createOpeningStock: (_productId, payload) =>
    mutationResult(INVENTORY_TRANSACTION_TYPE.OPENING_STOCK, payload.quantity, payload.reason, payload.remarks),
  stockIn: (_productId, payload) =>
    mutationResult(INVENTORY_TRANSACTION_TYPE.STOCK_IN, payload.quantity, payload.reason, payload.remarks),
  stockOut: (_productId, payload) =>
    mutationResult(INVENTORY_TRANSACTION_TYPE.STOCK_OUT, payload.quantity, payload.reason, payload.remarks),
  adjustStock: (_productId, payload) =>
    mutationResult(
      payload.adjustmentType === "INCREASE"
        ? INVENTORY_TRANSACTION_TYPE.ADJUSTMENT_IN
        : INVENTORY_TRANSACTION_TYPE.ADJUSTMENT_OUT,
      payload.quantity,
      payload.reason,
      payload.remarks,
    ),
  adjustStockIn: (_productId, payload) =>
    mutationResult(INVENTORY_TRANSACTION_TYPE.ADJUSTMENT_IN, payload.quantity, payload.reason, payload.remarks),
  adjustStockOut: (_productId, payload) =>
    mutationResult(INVENTORY_TRANSACTION_TYPE.ADJUSTMENT_OUT, payload.quantity, payload.reason, payload.remarks),
  markDamagedStock: (_productId, payload) =>
    mutationResult(INVENTORY_TRANSACTION_TYPE.DAMAGED, payload.quantity, payload.reason, payload.remarks),
};
