import { useMemo, useState } from "react";
import Breadcrumb from "../../../../shared/components/Breadcrumb";
import EmptyState from "../../../../shared/components/EmptyState";
import PageHero from "../../../../shared/components/PageHero";
import Pagination from "../../../../shared/components/Pagination";
import ProductGrid from "../../../../shared/components/ProductGrid";
import SEO from "../../../../shared/components/SEO";
import { pageSize } from "../../../../constants/ui.constants";
import { usePublicData } from "../../../../hooks/usePublicData";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { heroImages } from "../../data/company.data";
import { publicCategoriesApi } from "../../categories/api/publicCategories.api";
import { publicProductsApi } from "../api/publicProducts.api";
import ProductFilters from "../components/ProductFilters";

export default function ProductsPage() {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [page, setPage] = useState(1);
  const productState = usePublicData(publicProductsApi.getProducts, []);
  const categoryState = usePublicData(publicCategoriesApi.getCategories, []);

  const filteredProducts = useMemo(() => {
    const search = query.trim().toLowerCase();
    const source = productState.data || [];
    const filtered = source.filter((product) => {
      const matchesCategory = selectedCategory === "all" || product.categorySlug === selectedCategory;
      const haystack = [
        product.name,
        t(product.name),
        product.category,
        t(product.category),
        product.shortDescription,
        t(product.shortDescription),
        product.description,
        t(product.description),
        ...product.benefits,
        ...product.benefits.map((benefit) => t(benefit)),
        ...product.suitableCrops,
        ...product.suitableCrops.map((crop) => t(crop)),
      ]
        .join(" ")
        .toLowerCase();

      return matchesCategory && (!search || haystack.includes(search));
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      return Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name);
    });
  }, [productState.data, query, selectedCategory, sortBy, t]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleFilterChange = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  return (
    <>
      <SEO
        description="Browse KN Agro's public catalogue of bio fertilizers, organic fertilizers, micronutrients, growth promoters and agricultural inputs."
        image={heroImages.field}
        path="/products"
        title="Products"
      />
      <PageHero
        breadcrumbs={[{ label: "Products" }]}
        description="Search and filter KN Agro's agricultural product catalogue. This is a catalogue and enquiry experience, not an online checkout."
        eyebrow="Product Catalogue"
        image={heroImages.field}
        title="Agricultural Products for Crop and Soil Support"
      />
      <section className="section-padding">
        <div className="site-container">
          <Breadcrumb items={[{ label: "Products" }]} />
          <div className="mt-8">
            <ProductFilters
              categories={categoryState.data || []}
              onCategoryChange={handleFilterChange(setSelectedCategory)}
              onQueryChange={handleFilterChange(setQuery)}
              onSortChange={handleFilterChange(setSortBy)}
              query={query}
              selectedCategory={selectedCategory}
              sortBy={sortBy}
            />
          </div>
          {productState.isError ? (
            <div className="mt-8">
              <EmptyState
                actionLabel="Send Enquiry"
                actionTo="/enquiry"
                description={productState.error}
                title="Unable to load products"
              />
            </div>
          ) : (
            <div className="mt-10">
              <ProductGrid isLoading={productState.isLoading} products={visibleProducts} />
              <Pagination onPageChange={setPage} page={currentPage} totalPages={totalPages} />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
