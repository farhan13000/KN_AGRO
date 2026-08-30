import { getProductUnitLabel } from "../../../../features/products/utils";
import { simulateNetwork } from "../../../../utils/mockApi";
import { products } from "../../data/products.data";

// Temporary static data source while the backend product APIs are not wired up yet.
// Function signatures below are kept identical to the real backend-backed API so
// pages can switch back without changes once the backend is ready.

const toPublicProductView = (product) => ({
  ...product,
  unit: getProductUnitLabel(product.apiUnit),
});

const matchesSearch = (product, search) => {
  if (!search) return true;
  const term = search.toLowerCase();
  return (
    product.name.toLowerCase().includes(term) ||
    product.shortDescription.toLowerCase().includes(term) ||
    product.category.toLowerCase().includes(term)
  );
};

const sortProducts = (list, sortBy, sortOrder) => {
  const direction = sortOrder === "asc" ? 1 : -1;
  return [...list].sort((a, b) => {
    if (sortBy === "name") return direction * a.name.localeCompare(b.name);
    if (sortBy === "sellingPrice") return direction * (a.sellingPrice - b.sellingPrice);
    return direction * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  });
};

const getPublicProducts = async (query = {}) => {
  const { limit = 100, search = "", category = "", unit = "", sortBy = "createdAt", sortOrder = "desc" } = query || {};

  let filtered = products.filter((product) => product.active);
  if (category) filtered = filtered.filter((product) => product.categoryId === category);
  if (unit) filtered = filtered.filter((product) => product.apiUnit === unit);
  filtered = filtered.filter((product) => matchesSearch(product, search.trim()));

  const sorted = sortProducts(filtered, sortBy, sortOrder);
  const total = sorted.length;
  const safeLimit = Number(limit) > 0 ? Number(limit) : total || 1;
  const paged = sorted.slice(0, safeLimit).map(toPublicProductView);

  return simulateNetwork({
    products: paged,
    pagination: { page: 1, limit: safeLimit, total, pages: Math.max(1, Math.ceil(total / safeLimit)) },
  });
};

const getProducts = async (query) => {
  const data = await getPublicProducts(query);
  return data.products;
};

const getFeaturedProducts = async () => {
  const data = await getPublicProducts({ limit: 5, sortBy: "createdAt", sortOrder: "desc" });
  return data.products;
};

const getPublicProductBySlug = async (slug) => {
  const safeSlug = String(slug || "").trim();
  const product = products.find((item) => item.slug === safeSlug && item.active) || null;
  return simulateNetwork({ product: product ? toPublicProductView(product) : null });
};

const getProductBySlug = async (slug) => {
  const data = await getPublicProductBySlug(slug);
  return data.product;
};

const getProductsByCategory = async (categorySlug) => {
  const data = await getPublicProducts({ category: categorySlug, limit: 100 });
  return data.products;
};

const getRelatedProducts = async (product) => {
  if (!product?.categoryId) return [];
  const data = await getPublicProducts({ category: product.categoryId, limit: 4 });
  return data.products.filter((item) => item.id !== product.id).slice(0, 3);
};

export const publicProductsApi = {
  getPublicProducts,
  getProducts,
  getFeaturedProducts,
  getPublicProductBySlug,
  getProductBySlug,
  getProductsByCategory,
  getRelatedProducts,
};
