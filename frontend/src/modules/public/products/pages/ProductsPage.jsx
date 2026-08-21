import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../../../../shared/components/EmptyState";
import Icon from "../../../../shared/components/Icon";
import SEO from "../../../../shared/components/SEO";
import { usePublicData } from "../../../../hooks/usePublicData";
import { useLanguage } from "../../../../i18n/LanguageContext";
import heroSectionImage from "../../../../assets/Hero Section Image.png";
import { publicCategoriesApi } from "../../categories/api/publicCategories.api";
import { publicProductsApi } from "../api/publicProducts.api";

const initialVisibleCount = 5;
const loadMoreCount = 5;
const sortOptions = [
  { label: "Sort by: Featured", value: "featured" },
  { label: "Sort by: Name A-Z", value: "name-asc" },
  { label: "Sort by: Name Z-A", value: "name-desc" },
];
const formFilters = [
  { label: "Granular", values: ["Granules"] },
  { label: "Powder", values: ["Powder"] },
];

export default function ProductsPage() {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [selectedForms, setSelectedForms] = useState([]);
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount);
  const [viewMode, setViewMode] = useState("grid");
  const productState = usePublicData(publicProductsApi.getProducts, []);
  const categoryState = usePublicData(publicCategoriesApi.getCategories, []);

  const products = productState.data || [];
  const categories = categoryState.data || [];

  const categoryItems = useMemo(
    () => [
      {
        icon: "PackageCheck",
        name: "All Products",
        slug: "all",
        count: products.length,
      },
      ...categories.map((category) => ({
        ...category,
        count: products.filter((product) => product.categorySlug === category.slug).length,
      })),
    ],
    [categories, products],
  );

  const filterCounts = useMemo(
    () =>
      formFilters.map((filter) => ({
        ...filter,
        count: products.filter((product) => filter.values.includes(product.unit)).length,
      })),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const search = query.trim().toLowerCase();
    const selectedFormValues = formFilters
      .filter((filter) => selectedForms.includes(filter.label))
      .flatMap((filter) => filter.values);

    const filtered = products.filter((product) => {
      const matchesCategory = selectedCategory === "all" || product.categorySlug === selectedCategory;
      const matchesForm = !selectedFormValues.length || selectedFormValues.includes(product.unit);
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

      return matchesCategory && matchesForm && (!search || haystack.includes(search));
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      return Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name);
    });
  }, [products, query, selectedCategory, selectedForms, sortBy, t]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMoreProducts = visibleProducts.length < filteredProducts.length;

  const resetVisibleProducts = () => setVisibleCount(initialVisibleCount);
  const activeCategory = categoryItems.find((category) => category.slug === selectedCategory) || categoryItems[0];
  const hasActiveFilters =
    query.trim().length > 0 || selectedCategory !== "all" || selectedForms.length > 0 || sortBy !== "featured";

  const handleCategoryChange = (slug) => {
    setSelectedCategory(slug);
    resetVisibleProducts();
  };

  const handleFormToggle = (label) => {
    setSelectedForms((current) =>
      current.includes(label) ? current.filter((item) => item !== label) : [...current, label],
    );
    resetVisibleProducts();
  };

  const clearFilters = () => {
    setQuery("");
    setSelectedCategory("all");
    setSelectedForms([]);
    setSortBy("featured");
    resetVisibleProducts();
  };

  return (
    <>
      <SEO
        description="Browse KN Agro's public catalogue of bio fertilizers, organic fertilizers, micronutrients, growth promoters and agricultural inputs."
        image={heroSectionImage}
        path="/products"
        title="Products"
      />

      <ProductsHero />

      <section className="bg-[linear-gradient(180deg,#fbfcf8_0%,#ffffff_54%,#f6faf3_100%)] py-8 lg:py-10">
        <div className="mx-auto grid w-full max-w-[1480px] gap-6 px-4 sm:px-6 lg:grid-cols-[286px_minmax(0,1fr)] lg:px-8">
          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <FilterPanel title="Categories">
              <div className="space-y-1">
                {categoryItems.map((category) => {
                  const isActive = selectedCategory === category.slug;
                  return (
                    <button
                      className={`group flex min-h-12 w-full items-center gap-3 rounded-xl border px-3 text-left text-sm font-semibold transition ${
                        isActive
                          ? "border-leaf/30 bg-mint text-forest shadow-sm"
                          : "border-transparent text-ink hover:border-forest/10 hover:bg-mint/70 hover:text-forest"
                      }`}
                      key={category.slug}
                      onClick={() => handleCategoryChange(category.slug)}
                      type="button"
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          isActive ? "bg-white text-agriculture" : "bg-mint text-forest group-hover:bg-white"
                        }`}
                      >
                        <Icon name={category.icon} className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">{t(category.name)}</span>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-black ${
                          isActive ? "bg-white text-forest" : "bg-mint text-muted"
                        }`}
                      >
                        {category.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </FilterPanel>

            <FilterPanel title="Filter By">
              <p className="text-sm font-extrabold text-ink">{t("Form")}</p>
              <div className="mt-3 space-y-3">
                {filterCounts.map((filter) => (
                  <label className="flex cursor-pointer items-center gap-3 text-sm text-ink" key={filter.label}>
                    <input
                      checked={selectedForms.includes(filter.label)}
                      className="h-4 w-4 rounded border-forest/25 text-forest accent-forest"
                      onChange={() => handleFormToggle(filter.label)}
                      type="checkbox"
                    />
                    <span className="flex-1">{t(filter.label)}</span>
                    <span className="text-xs font-semibold text-muted">({filter.count})</span>
                  </label>
                ))}
              </div>
            </FilterPanel>
          </aside>

          <div>
            <div className="rounded-2xl border border-forest/10 bg-white/95 p-4 shadow-card ring-1 ring-white/70 sm:p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">
                    {t("Product Catalogue")}
                  </p>
                  <h2 className="mt-1 text-2xl font-black leading-tight text-ink">{t(activeCategory?.name)}</h2>
                  <p className="mt-2 text-sm font-semibold text-muted">
                    {productState.isLoading
                      ? t("Loading products...")
                      : t("Showing {{visible}} of {{total}} products", {
                          visible: String(visibleProducts.length),
                          total: String(filteredProducts.length),
                        })}
                  </p>
                </div>

                {hasActiveFilters ? (
                  <button
                    className="inline-flex min-h-10 w-fit items-center justify-center gap-2 rounded-lg border border-forest/20 bg-white px-4 text-sm font-extrabold text-forest transition hover:bg-mint"
                    onClick={clearFilters}
                    type="button"
                  >
                    <Icon name="X" className="h-4 w-4" />
                    {t("Reset Filters")}
                  </button>
                ) : null}
              </div>

              <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,380px)_1fr] lg:items-center">
                <label className="relative block w-full">
                  <span className="sr-only">{t("Search products")}</span>
                  <Icon
                    name="Search"
                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                  />
                  <input
                    className="h-12 w-full rounded-xl border border-forest/14 bg-white px-11 text-sm font-semibold text-ink shadow-sm outline-none transition placeholder:font-medium placeholder:text-muted focus:border-agriculture focus:ring-4 focus:ring-leaf/20"
                    onChange={(event) => {
                      setQuery(event.target.value);
                      resetVisibleProducts();
                    }}
                    placeholder={t("Search products...")}
                    type="search"
                    value={query}
                  />
                  {query ? (
                    <button
                      aria-label={t("Clear Search")}
                      className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-mint text-forest transition hover:bg-forest hover:text-white"
                      onClick={() => {
                        setQuery("");
                        resetVisibleProducts();
                      }}
                      type="button"
                    >
                      <Icon name="X" className="h-4 w-4" />
                    </button>
                  ) : null}
                </label>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <label className="sr-only" htmlFor="products-sort">
                    {t("Sort")}
                  </label>
                  <select
                    className="h-12 w-full rounded-xl border border-forest/14 bg-white px-4 pr-10 text-sm font-extrabold text-ink shadow-sm outline-none focus:border-agriculture focus:ring-4 focus:ring-leaf/20 sm:w-[220px]"
                    id="products-sort"
                    onChange={(event) => {
                      setSortBy(event.target.value);
                      resetVisibleProducts();
                    }}
                    value={sortBy}
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {t(option.label)}
                      </option>
                    ))}
                  </select>

                  <div className="grid grid-cols-2 gap-1 rounded-xl bg-mint p-1 sm:w-auto">
                    <ViewToggle
                      active={viewMode === "grid"}
                      icon="Grid2X2"
                      label="Grid view"
                      onClick={() => setViewMode("grid")}
                    />
                    <ViewToggle
                      active={viewMode === "list"}
                      icon="List"
                      label="List view"
                      onClick={() => setViewMode("list")}
                    />
                  </div>
                </div>
              </div>
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
              <div className="mt-6">
                <div
                  className={
                    viewMode === "grid"
                      ? "grid items-start gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5"
                      : "grid items-start gap-5"
                  }
                >
                  {productState.isLoading
                    ? Array.from({ length: initialVisibleCount }).map((_, index) => <ProductSkeleton key={index} />)
                    : visibleProducts.map((product) => (
                        <CatalogueProductCard key={product.id} product={product} viewMode={viewMode} />
                      ))}
                </div>

                {!productState.isLoading && !filteredProducts.length ? (
                  <div className="mt-8">
                    <EmptyState
                      description="Try a different category, search, or form filter."
                      title="No products match this selection"
                    />
                  </div>
                ) : null}

                {hasMoreProducts ? (
                  <div className="mt-8 flex justify-center">
                    <button
                      className="inline-flex min-h-12 min-w-52 items-center justify-center gap-3 rounded-xl border border-forest/40 bg-white px-6 text-sm font-extrabold text-forest shadow-sm transition hover:bg-mint"
                      onClick={() => setVisibleCount((current) => current + loadMoreCount)}
                      type="button"
                    >
                      {t("Load More Products")}
                      <Icon name="ChevronDown" className="h-4 w-4" />
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function ProductsHero() {
  const { t } = useLanguage();

  return (
    <section className="relative isolate min-h-[390px] overflow-hidden border-b border-forest/10 bg-white lg:min-h-[360px]">
      <img
        alt="KN Agro products arranged in a green agricultural field"
        className="absolute inset-0 h-full w-full object-cover object-[70%_center] sm:object-[62%_center] lg:object-center"
        loading="eager"
        src={heroSectionImage}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-white/82 via-white/42 to-white/0" />
      <div className="absolute inset-y-0 left-0 w-full bg-white/10 sm:w-[58%] lg:w-[46%]" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#fbfcf8]/60 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[390px] w-full max-w-[1480px] items-center px-4 py-10 sm:px-6 lg:min-h-[360px] lg:px-8">
        <div className="max-w-xl rounded-2xl border border-white/45 bg-white/58 p-5 shadow-[0_12px_32px_rgba(23,76,43,0.09)] backdrop-blur-[1px] sm:p-6 lg:max-w-2xl">
          <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-agriculture">{t("Our Products")}</p>
          <h1 className="mt-4 text-4xl font-black leading-[1.1] text-ink sm:text-5xl lg:text-[3.35rem]">
            {t("Quality Products for Better Crop Growth")}
          </h1>
          <p className="mt-5 max-w-xl text-base font-semibold leading-7 text-[#253326]">
            {t(
              "Explore our wide range of bio-fertilizers, organic fertilizers, micronutrients and plant growth promoters for healthy soil and higher yield.",
            )}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-forest px-5 text-sm font-extrabold text-white shadow-card transition hover:bg-agriculture"
              to="/enquiry"
            >
              {t("Send Product Enquiry")}
              <Icon name="ArrowRight" className="h-4 w-4" />
            </Link>
            <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-forest/30 bg-white/60 px-5 text-sm font-extrabold text-forest transition hover:bg-mint"
              to="/categories"
            >
              {t("Browse Categories")}
              <Icon name="ChevronRight" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function FilterPanel({ title, children }) {
  const { t } = useLanguage();

  return (
    <div className="rounded-2xl border border-forest/10 bg-white/95 p-4 shadow-card ring-1 ring-white/70">
      <h2 className="mb-4 text-base font-black uppercase tracking-[0.02em] text-forest">{t(title)}</h2>
      {children}
    </div>
  );
}

function ViewToggle({ active, icon, label, onClick }) {
  const { t } = useLanguage();

  return (
    <button
      aria-label={t(label)}
      className={`flex h-10 min-w-10 items-center justify-center rounded-lg transition ${
        active ? "bg-forest text-white shadow-card" : "bg-transparent text-forest hover:bg-white"
      }`}
      onClick={onClick}
      title={t(label)}
      type="button"
    >
      <Icon name={icon} className="h-5 w-5" />
    </button>
  );
}

function CatalogueProductCard({ product, viewMode }) {
  const { t } = useLanguage();
  const isList = viewMode === "list";
  const imageClass =
    product.imageFit === "contain"
      ? `${isList ? "max-h-48" : "max-h-40"} w-full object-contain drop-shadow-[0_10px_10px_rgba(23,76,43,0.10)] transition duration-500 group-hover:scale-105`
      : "h-full w-full object-cover transition duration-500 group-hover:scale-105";

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-2xl border border-forest/10 bg-white shadow-card transition hover:-translate-y-1 hover:border-leaf/35 hover:shadow-soft ${
        isList ? "md:flex-row md:items-stretch" : ""
      }`}
    >
      <Link
        className={`relative flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,rgba(120,169,66,0.14),transparent_52%),linear-gradient(180deg,#f7fbf3_0%,#edf6e8_100%)] p-4 ${
          isList ? "min-h-48 md:w-60 md:min-h-full md:shrink-0" : "min-h-48"
        }`}
        to={`/products/${product.slug}`}
      >
        <span className="absolute left-3 top-3 rounded-full bg-mint/90 px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-forest shadow-sm">
          {t(product.unit)}
        </span>
        <img
          alt={`${product.name} agricultural product pack`}
          className={imageClass}
          loading="lazy"
          src={product.image}
        />
      </Link>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <span className="w-fit rounded-full bg-mint px-3 py-1 text-[11px] font-extrabold text-forest">
          {t(product.category)}
        </span>
        <h3 className="mt-3 text-lg font-black leading-tight text-ink">{t(product.name)}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{t(product.shortDescription)}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-forest/10 bg-[#fbfcf8] px-3 py-1 text-xs font-extrabold text-forest">
            {t("Form")}: {t(product.unit)}
          </span>
          <span className="rounded-full border border-forest/10 bg-[#fbfcf8] px-3 py-1 text-xs font-extrabold text-forest">
            {t(product.packSize)}
          </span>
        </div>

        <div className={`mt-4 grid gap-2 ${isList ? "sm:grid-cols-2 md:max-w-sm" : "grid-cols-2"}`}>
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-forest/35 bg-white px-3 text-center text-xs font-extrabold leading-snug text-forest transition hover:bg-mint"
            to={`/products/${product.slug}`}
          >
            {t("View Details")}
          </Link>
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-xl bg-forest px-3 text-center text-xs font-extrabold leading-snug text-white shadow-sm transition hover:bg-agriculture"
            to={`/enquiry?product=${product.slug}`}
          >
            {t("Enquire Now")}
          </Link>
        </div>
      </div>
    </article>
  );
}

function ProductSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-forest/10 bg-white shadow-card">
      <div className="min-h-48 bg-mint" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-24 rounded-full bg-mint" />
        <div className="h-5 w-2/3 rounded bg-mint" />
        <div className="h-4 w-full rounded bg-mint" />
        <div className="h-4 w-4/5 rounded bg-mint" />
      </div>
    </div>
  );
}
