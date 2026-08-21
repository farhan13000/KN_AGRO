import { useLanguage } from "../../i18n/LanguageContext";
import Button from "./Button";
import Badge from "./Badge";
import ProductPackVisual from "./ProductPackVisual";

export default function ProductCard({ product, compact = false, showEnquiry = true }) {
  const { t } = useLanguage();
  const imageClass =
    product.imageFit === "contain"
      ? "h-full w-full object-contain transition duration-500 group-hover:scale-105"
      : "h-full w-full object-cover transition duration-500 group-hover:scale-105";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-forest/10 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-soft">
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-b from-white to-mint/70 p-5">
        {product.image ? (
          <img
            alt={`${product.name} agricultural product visual`}
            className={imageClass}
            loading="lazy"
            src={product.image}
          />
        ) : product.visual ? (
          <ProductPackVisual product={product} />
        ) : null}
      </div>
      <div className={`flex flex-1 flex-col ${compact ? "p-4" : "p-5"}`}>
        <Badge className="mb-3 bg-transparent px-0 text-[11px] text-agriculture">{product.category}</Badge>
        <h3 className={`${compact ? "text-base" : "text-xl"} font-extrabold text-ink`}>{t(product.name)}</h3>
        <p className={`${compact ? "mt-2 text-xs leading-5" : "mt-3 text-sm leading-6"} flex-1 text-muted`}>
          {t(product.shortDescription)}
        </p>
        {!compact ? (
          <div className="mt-5 rounded-xl bg-mint px-4 py-3 text-sm font-semibold text-forest">
            {t("Pack / Unit")}: {product.packSize}
          </div>
        ) : null}
        <div className={`mt-5 grid gap-3 ${showEnquiry ? "grid-cols-2" : "grid-cols-1"}`}>
          <Button className="min-h-10 px-3 py-2 text-xs" to={`/products/${product.slug}`} variant="secondary">
            View Details
          </Button>
          {showEnquiry ? (
            <Button className="min-h-10 px-3 py-2 text-xs" to={`/enquiry?product=${product.slug}`}>
              Enquire
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
