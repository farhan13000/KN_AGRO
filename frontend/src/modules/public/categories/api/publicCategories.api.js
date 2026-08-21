import { simulateNetwork } from "../../../../utils/mockApi";
import { categories } from "../../data/categories.data";
import { products } from "../../data/products.data";

const withProductCount = categories.map((category) => ({
  ...category,
  productCount: products.filter((product) => product.active && product.categorySlug === category.slug).length,
}));

export const publicCategoriesApi = {
  getCategories: () => simulateNetwork(withProductCount),
  getCategoryBySlug: (slug) =>
    simulateNetwork(withProductCount.find((category) => category.slug === slug) || null),
};
