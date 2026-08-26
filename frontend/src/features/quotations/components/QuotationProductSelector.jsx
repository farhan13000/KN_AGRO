import { Search } from "lucide-react";
import { useState } from "react";
import Button from "../../../shared/components/Button";
import { useDebouncedValue } from "../../../shared/hooks";
import { formatProductPrice, getProductUnitLabel, useProductList } from "../../products";

// Selecting a product only initializes an editable quotation item on the
// builder's client-side state — it never writes anything by itself. Once
// the quotation is saved, the backend's own item snapshot is authoritative;
// this selector's job ends the moment `onSelect` fires.
export default function QuotationProductSelector({ excludeProductIds = [], onSelect }) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const productsState = useProductList({
    limit: 20,
    search: debouncedSearch,
    sortBy: "name",
    sortOrder: "asc",
    status: "ACTIVE",
  });
  const products = productsState.data?.products || [];
  const excluded = new Set(excludeProductIds);

  return (
    <div className="rounded-lg border border-forest/10 bg-white p-4">
      <label>
        <span className="form-label">Add Product</span>
        <span className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            className="form-field pl-10"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search product code or name"
            type="search"
            value={search}
          />
        </span>
      </label>

      {productsState.isLoading ? <p className="mt-3 text-sm text-muted">Loading products...</p> : null}
      {productsState.isError ? (
        <p className="mt-3 text-sm font-semibold text-red-700">{productsState.errorMessage}</p>
      ) : null}

      {!productsState.isLoading && !productsState.isError ? (
        <ul className="mt-3 max-h-72 divide-y divide-forest/10 overflow-y-auto rounded-lg border border-forest/10">
          {products.map((product) => {
            const alreadyAdded = excluded.has(product._id);
            return (
              <li className="flex items-center justify-between gap-3 px-3 py-2.5" key={product._id}>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-ink">{product.name}</p>
                  <p className="mt-0.5 text-xs font-semibold text-muted">
                    {[product.productCode, product.category?.name, getProductUnitLabel(product.unit)]
                      .filter(Boolean)
                      .join(" | ")}{" "}
                    &middot; {formatProductPrice(product.sellingPrice)}
                  </p>
                </div>
                <Button
                  disabled={alreadyAdded}
                  onClick={() => onSelect(product)}
                  type="button"
                  variant="secondary"
                >
                  {alreadyAdded ? "Added" : "Add"}
                </Button>
              </li>
            );
          })}
          {!products.length ? (
            <li className="px-3 py-4 text-center text-sm text-muted">No active products matched.</li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
