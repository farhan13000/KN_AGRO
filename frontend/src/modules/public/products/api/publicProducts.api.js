import { API_ENDPOINTS, apiClient, unwrapApiData } from "../../../../core/api";
import { getProductUnitLabel } from "../../../../features/products/utils";
import { publicCategoriesApi } from "../../categories/api/publicCategories.api";

const cleanPublicProductQuery = (query = {}) =>
  Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== "" && value !== null && value !== undefined),
  );

const firstPresentSpec = (specifications = {}, keys = []) => {
  for (const key of keys) {
    if (specifications[key]) return specifications[key];
  }
  return "";
};

const toList = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return String(value)
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const toTechnicalInfo = (product = {}) => {
  const specs = product.specifications || {};
  const specItems = Object.entries(specs).map(([key, value]) => `${key}: ${value}`);
  return [
    product.category?.name ? `Category: ${product.category.name}` : "",
    product.unit ? `Unit: ${getProductUnitLabel(product.unit)}` : "",
    ...specItems,
  ].filter(Boolean);
};

const getPrimaryImage = (images = []) =>
  images.find((image) => image.isPrimary)?.url || images[0]?.url || "";

const toPublicProductView = (product = {}) => {
  const specifications = product.specifications || {};
  const gallery = (product.images || []).map((image) => image.url).filter(Boolean);
  const image = getPrimaryImage(product.images);
  const categoryName = product.category?.name || "";
  const categorySlug = product.category?.slug || "";

  return {
    ...product,
    id: product._id || product.id || product.slug,
    category: categoryName,
    categoryId: product.category?._id || "",
    categorySlug,
    shortDescription: product.shortDescription || product.description || product.name || "",
    description: product.description || product.shortDescription || "",
    image,
    imageFit: "contain",
    gallery: gallery.length ? gallery : image ? [image] : [],
    packSize: firstPresentSpec(specifications, ["Pack Size", "Pack size", "packSize"]) || getProductUnitLabel(product.unit),
    unit: getProductUnitLabel(product.unit),
    apiUnit: product.unit,
    benefits: toList(firstPresentSpec(specifications, ["Benefits", "Main Benefits", "benefits"])),
    applications: toList(firstPresentSpec(specifications, ["Application", "Applications", "Usage", "applications"])),
    suitableCrops: toList(firstPresentSpec(specifications, ["Suitable Crops", "Crop Type", "Crop", "suitableCrops"])),
    technicalInfo: toTechnicalInfo(product),
    featured: false,
    availability: product.availability || "",
    active: product.availability !== "OUT_OF_STOCK",
  };
};

const getMockPublicProductApi = async () => {
  if (!(import.meta.env.DEV && import.meta.env.VITE_USE_PHASE3_MOCK === "true")) {
    return null;
  }

  const { mockPublicProductApi } = await import("../../../../mocks/products/product.mock");
  return mockPublicProductApi;
};

const getPublicProducts = async (query) => {
  const mock = await getMockPublicProductApi();
  if (mock) {
    const data = await mock.getPublicProducts(query);
    return {
      ...data,
      products: (data?.products || []).map(toPublicProductView),
    };
  }

  const response = await apiClient.get(API_ENDPOINTS.PUBLIC.PRODUCTS, {
    params: cleanPublicProductQuery(query),
  });
  const data = unwrapApiData(response);
  return {
    ...data,
    products: (data?.products || []).map(toPublicProductView),
  };
};

const getProducts = async (query) => {
  const data = await getPublicProducts(query);
  return data.products;
};

const getFeaturedProducts = async () => {
  const data = await getPublicProducts({ page: 1, limit: 5, sortBy: "createdAt", sortOrder: "desc" });
  return data.products;
};

const getPublicProductBySlug = async (slug) => {
  const safeSlug = String(slug || "").trim();
  if (!safeSlug) return { product: null };

  const mock = await getMockPublicProductApi();
  if (mock) {
    const data = await mock.getPublicProductBySlug(safeSlug);
    return {
      ...data,
      product: data?.product ? toPublicProductView(data.product) : null,
    };
  }

  const response = await apiClient.get(API_ENDPOINTS.PUBLIC.PRODUCT_DETAIL(encodeURIComponent(safeSlug)));
  const data = unwrapApiData(response);
  return {
    ...data,
    product: data?.product ? toPublicProductView(data.product) : null,
  };
};

const getProductBySlug = async (slug) => {
  const data = await getPublicProductBySlug(slug);
  return data.product;
};

const getProductsByCategory = async (categorySlug) => {
  const category = await publicCategoriesApi.getCategoryBySlug(categorySlug);
  if (!category?._id) return [];
  const data = await getPublicProducts({ category: category._id, limit: 100 });
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
