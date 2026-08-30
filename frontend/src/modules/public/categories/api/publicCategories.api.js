import { simulateNetwork } from "../../../../utils/mockApi";
import { categories } from "../../data/categories.data";
import { products } from "../../data/products.data";

// Temporary static data source while the backend category APIs are not wired up yet.
// Function signatures below are kept identical to the real backend-backed API so
// pages can switch back without changes once the backend is ready.

const countActiveProducts = (categorySlug) =>
  products.filter((product) => product.active && product.categorySlug === categorySlug).length;

const toPublicCategoryView = (category) => ({
  ...category,
  id: category.slug,
  _id: category.slug,
  productCount: countActiveProducts(category.slug),
  activeProductCount: countActiveProducts(category.slug),
});

const getPublicCategories = async () =>
  simulateNetwork({ categories: categories.map(toPublicCategoryView) });

const getCategories = async () => {
  const data = await getPublicCategories();
  return data.categories;
};

const getCategoryBySlug = async (slug) => {
  const list = await getCategories();
  return list.find((category) => category.slug === slug) || null;
};

export const publicCategoriesApi = {
  getPublicCategories,
  getCategories,
  getCategoryBySlug,
};
