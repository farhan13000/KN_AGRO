import { simulateNetwork } from "../../../../utils/mockApi";
import { products } from "../../data/products.data";

const activeProducts = products.filter((product) => product.active);

export const publicProductsApi = {
  getProducts: () => simulateNetwork(activeProducts),
  getFeaturedProducts: () => simulateNetwork(activeProducts.filter((product) => product.featured)),
  getProductBySlug: (slug) =>
    simulateNetwork(activeProducts.find((product) => product.slug === slug) || null),
  getProductsByCategory: (categorySlug) =>
    simulateNetwork(activeProducts.filter((product) => product.categorySlug === categorySlug)),
  getRelatedProducts: (product) =>
    simulateNetwork(
      activeProducts
        .filter((item) => item.categorySlug === product.categorySlug && item.id !== product.id)
        .slice(0, 3),
    ),
};
