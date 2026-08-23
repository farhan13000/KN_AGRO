import { simulateNetwork } from "../../utils/mockApi";
import { PRODUCT_STATUS, PRODUCT_UNIT } from "../../features/products/constants";
import { STOCK_STATUS } from "../../features/inventory/constants";

const now = "2026-08-23T00:00:00.000Z";

const category = {
  _id: "66f000000000000000000101",
  name: "Bio Fertilizers",
  slug: "bio-fertilizers",
};

const publicImage = {
  alt: "KN Agro product pack",
  isPrimary: true,
  url: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=900&q=80",
};

const mockProducts = [
  {
    _id: "66f000000000000000000201",
    productCode: "PRD-0001",
    name: "KN Bio Growth",
    slug: "kn-bio-growth",
    category,
    brand: "KN Agro",
    shortDescription: "Bio fertilizer for balanced crop nutrition.",
    description: "Bio fertilizer for practical soil and crop nutrition programs.",
    unit: PRODUCT_UNIT.KG,
    purchasePrice: 280,
    sellingPrice: 420,
    taxRate: 5,
    minimumStock: 20,
    images: [publicImage],
    specifications: {
      "Pack Size": "25 kg",
      Benefits: "Supports soil biology, improves nutrient availability",
      Application: "Soil application",
      "Crop Type": "Vegetables, cereals, pulses",
    },
    status: PRODUCT_STATUS.ACTIVE,
    stock: {
      currentStock: 70,
      reservedStock: 5,
      availableStock: 65,
      minimumStock: 20,
      stockStatus: STOCK_STATUS.IN_STOCK,
    },
    createdAt: now,
    updatedAt: now,
  },
];

const pagination = {
  page: 1,
  limit: 10,
  total: mockProducts.length,
  pages: 1,
};

const toPublicProduct = ({ purchasePrice, stock, createdAt, updatedAt, status, ...product }) => ({
  _id: product._id,
  productCode: product.productCode,
  name: product.name,
  slug: product.slug,
  brand: product.brand,
  category: product.category,
  shortDescription: product.shortDescription,
  description: product.description,
  sellingPrice: product.sellingPrice,
  taxRate: product.taxRate,
  unit: product.unit,
  images: product.images.map(({ publicId, ...image }) => image),
  specifications: product.specifications,
  availability: stock.availableStock > 0 ? "AVAILABLE" : "OUT_OF_STOCK",
});

export const mockProductApi = {
  getProducts: () => simulateNetwork({ products: mockProducts, pagination }),
  getProductSummary: () =>
    simulateNetwork({
      totalProducts: mockProducts.length,
      activeProducts: mockProducts.filter((product) => product.status === PRODUCT_STATUS.ACTIVE).length,
      inactiveProducts: mockProducts.filter((product) => product.status === PRODUCT_STATUS.INACTIVE).length,
      discontinuedProducts: mockProducts.filter((product) => product.status === PRODUCT_STATUS.DISCONTINUED).length,
    }),
  getProductById: (productId) =>
    simulateNetwork({ product: mockProducts.find((product) => product._id === productId) || null }),
  createProduct: (payload) =>
    simulateNetwork({
      product: {
        ...payload,
        _id: "66f000000000000000000299",
        productCode: "PRD-0002",
        slug: payload.name?.toLowerCase().replace(/\s+/g, "-"),
        status: PRODUCT_STATUS.ACTIVE,
        inventory: {
          currentStock: 0,
          reservedStock: 0,
          availableStock: 0,
          minimumStock: payload.minimumStock || 0,
        },
        createdAt: now,
        updatedAt: now,
      },
    }),
  updateProduct: (productId, payload) =>
    simulateNetwork({
      product: {
        ...(mockProducts.find((product) => product._id === productId) || mockProducts[0]),
        ...payload,
        updatedAt: now,
      },
    }),
  changeProductStatus: (productId, payload) =>
    simulateNetwork({
      product: {
        ...(mockProducts.find((product) => product._id === productId) || mockProducts[0]),
        status: payload.status,
        updatedAt: now,
      },
    }),
};

export const mockPublicProductApi = {
  getPublicProducts: () =>
    simulateNetwork({
      products: mockProducts.filter((product) => product.status === PRODUCT_STATUS.ACTIVE).map(toPublicProduct),
      pagination,
    }),
  getPublicProductBySlug: (slug) =>
    simulateNetwork({
      product: mockProducts
        .filter((product) => product.status === PRODUCT_STATUS.ACTIVE)
        .map(toPublicProduct)
        .find((product) => product.slug === slug) || null,
    }),
};
