import { simulateNetwork } from "../../utils/mockApi";
import { CATEGORY_STATUS } from "../../features/categories/constants";

const now = "2026-08-23T00:00:00.000Z";

const mockCategories = [
  {
    _id: "66f000000000000000000101",
    name: "Bio Fertilizers",
    slug: "bio-fertilizers",
    description: "Microbial inputs for soil nutrition and crop establishment.",
    image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=900&q=80",
    status: CATEGORY_STATUS.ACTIVE,
    sortOrder: 1,
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: "66f000000000000000000102",
    name: "Micronutrients",
    slug: "micronutrients",
    description: "Targeted nutrition support for crop quality and growth stages.",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80",
    status: CATEGORY_STATUS.ACTIVE,
    sortOrder: 2,
    createdAt: now,
    updatedAt: now,
  },
];

const pagination = {
  page: 1,
  limit: 10,
  total: mockCategories.length,
  pages: 1,
};

export const mockCategoryApi = {
  getCategories: () => simulateNetwork({ categories: mockCategories, pagination }),
  getCategoryById: (categoryId) =>
    simulateNetwork({ category: mockCategories.find((category) => category._id === categoryId) || null }),
  createCategory: (payload) =>
    simulateNetwork({
      category: {
        ...payload,
        _id: "66f000000000000000000199",
        slug: payload.slug || payload.name?.toLowerCase().replace(/\s+/g, "-"),
        status: CATEGORY_STATUS.ACTIVE,
        createdAt: now,
        updatedAt: now,
      },
    }),
  updateCategory: (categoryId, payload) =>
    simulateNetwork({
      category: {
        ...(mockCategories.find((category) => category._id === categoryId) || mockCategories[0]),
        ...payload,
        updatedAt: now,
      },
    }),
  changeCategoryStatus: (categoryId, payload) =>
    simulateNetwork({
      category: {
        ...(mockCategories.find((category) => category._id === categoryId) || mockCategories[0]),
        status: payload.status,
        updatedAt: now,
      },
    }),
};

export const mockPublicCategoriesApi = {
  getPublicCategories: () =>
    simulateNetwork({
      categories: mockCategories
        .filter((category) => category.status === CATEGORY_STATUS.ACTIVE)
        .map((category, index) => ({ ...category, activeProductCount: index + 1 })),
    }),
};
