import SearchBox from "../../../../shared/components/SearchBox";
import Select from "../../../../shared/forms/Select";
import { productSortOptions } from "../../../../constants/ui.constants";

export default function ProductFilters({
  categories = [],
  query,
  selectedCategory,
  sortBy,
  onQueryChange,
  onCategoryChange,
  onSortChange,
}) {
  return (
    <div className="rounded-2xl border border-forest/10 bg-white p-4 shadow-card">
      <div className="grid gap-4 lg:grid-cols-[1fr_240px_220px]">
        <SearchBox label="Search products" onChange={onQueryChange} placeholder="Search by product, benefit or crop..." value={query} />
        <Select
          id="category-filter"
          label="Category"
          onChange={(event) => onCategoryChange(event.target.value)}
          options={[
            { label: "All Categories", value: "all" },
            ...categories.map((category) => ({ label: category.name, value: category.slug })),
          ]}
          value={selectedCategory}
        />
        <Select
          id="sort-products"
          label="Sort"
          onChange={(event) => onSortChange(event.target.value)}
          options={productSortOptions}
          value={sortBy}
        />
      </div>
    </div>
  );
}
