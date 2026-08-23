import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../../../core/api";

const categoryIconBySlug = {
  "bio-fertilizers": "Sprout",
  "organic-fertilizers": "Leaf",
  micronutrients: "FlaskConical",
  "growth-promoters": "TrendingUp",
  "soil-conditioners": "Layers",
  "compost-organic-products": "Recycle",
  "crop-nutrition": "Wheat",
  "specialty-agro-inputs": "PackageCheck",
};

const toPublicCategoryView = (category = {}) => ({
  ...category,
  id: category._id || category.id || category.slug,
  icon: category.icon || categoryIconBySlug[category.slug] || "PackageCheck",
  productCount: category.activeProductCount ?? category.productCount ?? 0,
  benefits: Array.isArray(category.benefits) ? category.benefits : [],
});

const getMockPublicCategoriesApi = async () => {
  if (!(import.meta.env.DEV && import.meta.env.VITE_USE_PHASE3_MOCK === "true")) {
    return null;
  }

  const { mockPublicCategoriesApi } = await import("../../../../mocks/categories/category.mock");
  return mockPublicCategoriesApi;
};

const getPublicCategories = async () => {
  const mock = await getMockPublicCategoriesApi();
  if (mock) {
    const data = await mock.getPublicCategories();
    return {
      ...data,
      categories: (data?.categories || []).map(toPublicCategoryView),
    };
  }

  const response = await apiClient.get(API_ENDPOINTS.PUBLIC.CATEGORIES);
  const data = unwrapApiData(response);
  return {
    ...data,
    categories: (data?.categories || []).map(toPublicCategoryView),
  };
};

const getCategories = async () => {
  const data = await getPublicCategories();
  return data.categories;
};

const getCategoryBySlug = async (slug) => {
  const categories = await getCategories();
  return categories.find((category) => category.slug === slug) || null;
};

export const publicCategoriesApi = {
  getPublicCategories,
  getCategories,
  getCategoryBySlug,
};
