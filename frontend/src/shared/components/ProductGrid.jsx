import EmptyState from "./EmptyState";
import ProductCard from "./ProductCard";
import SkeletonCard from "./SkeletonCard";

export default function ProductGrid({ products = [], isLoading = false }) {
  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <EmptyState
        description="Try adjusting the search or category filter, or send an enquiry and the KN Agro team can help."
        title="No products found"
      />
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
