import Button from "../../../../shared/components/Button";
import Icon from "../../../../shared/components/Icon";
import ProductCard from "../../../../shared/components/ProductCard";
import SkeletonCard from "../../../../shared/components/SkeletonCard";
import { useLanguage } from "../../../../i18n/LanguageContext";

export default function FeaturedProductsSection({ products = [], isLoading = false }) {
  const { t } = useLanguage();

  return (
    <section className="bg-white pb-16 pt-4">
      <div className="site-container">
        <div className="text-center">
          <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-agriculture">
            {t("Featured Products")}
          </p>
          <h2 className="mt-3 text-3xl font-black leading-tight text-ink sm:text-4xl">
            {t("Quality Products for Better Yield")}
          </h2>
          <Icon name="Leaf" className="mx-auto mt-3 h-5 w-5 fill-current text-agriculture" />
        </div>
        <div className="relative mt-10">
          <button
            aria-label="Previous featured products"
            className="absolute -left-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-forest shadow-card md:flex"
            type="button"
          >
            <Icon name="ChevronRight" className="h-5 w-5 rotate-180" />
          </button>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => <SkeletonCard key={index} />)
              : products.slice(0, 5).map((product) => (
                  <ProductCard compact key={product.id} product={product} showEnquiry={false} />
                ))}
          </div>
          <button
            aria-label="Next featured products"
            className="absolute -right-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-forest shadow-card md:flex"
            type="button"
          >
            <Icon name="ChevronRight" className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-8 flex justify-center">
          <Button className="rounded-lg px-7" to="/products" icon="ArrowRight">
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
}
