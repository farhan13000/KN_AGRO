import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Badge from "../../../../shared/components/Badge";
import Button from "../../../../shared/components/Button";
import EmptyState from "../../../../shared/components/EmptyState";
import Icon from "../../../../shared/components/Icon";
import PageHero from "../../../../shared/components/PageHero";
import ProductGrid from "../../../../shared/components/ProductGrid";
import SEO from "../../../../shared/components/SEO";
import { companyConfig } from "../../../../config/company.config";
import { usePublicData } from "../../../../hooks/usePublicData";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { buildWhatsAppUrl } from "../../../../utils/whatsapp";
import { heroImages } from "../../data/company.data";
import { publicProductsApi } from "../api/publicProducts.api";

export default function ProductDetailsPage() {
  const { t } = useLanguage();
  const { slug } = useParams();
  const [selectedImage, setSelectedImage] = useState("");
  const productState = usePublicData(() => publicProductsApi.getProductBySlug(slug), [slug]);
  const product = productState.data;
  const relatedState = usePublicData(
    () => (product ? publicProductsApi.getRelatedProducts(product) : Promise.resolve([])),
    [product?.id],
  );

  useEffect(() => {
    setSelectedImage("");
  }, [slug]);

  const gallery = useMemo(() => product?.gallery || [], [product]);
  const activeImage = selectedImage || gallery[0] || product?.image;
  const galleryImageClass =
    product?.imageFit === "contain" ? "aspect-square w-full object-contain p-8" : "aspect-square w-full object-cover";
  const thumbnailImageClass =
    product?.imageFit === "contain" ? "aspect-square w-full object-contain p-2" : "aspect-square w-full object-cover";

  if (productState.isLoading) {
    return (
      <section className="site-container py-20">
        <div className="animate-pulse rounded-[2rem] bg-white p-8 shadow-card">
          <div className="h-8 w-1/3 rounded bg-mint" />
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <div className="aspect-square rounded-2xl bg-mint" />
            <div className="space-y-4">
              <div className="h-10 w-4/5 rounded bg-mint" />
              <div className="h-5 w-full rounded bg-mint" />
              <div className="h-5 w-3/4 rounded bg-mint" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <>
        <SEO
          description="The requested KN Agro product could not be found."
          path={`/products/${slug}`}
          title="Product Not Found"
        />
        <PageHero
          breadcrumbs={[{ label: "Products", path: "/products" }, { label: "Not Found" }]}
          description="This product may be unavailable or the link may have changed."
          eyebrow="Product Catalogue"
          image={heroImages.field}
          title="Product Not Found"
        />
        <section className="site-container py-16">
          <EmptyState
            actionLabel="Browse Products"
            actionTo="/products"
            description="Explore the full catalogue or send an enquiry for product support."
            title="We could not find this product"
          />
        </section>
      </>
    );
  }

  return (
    <>
      <SEO
        description={product.shortDescription}
        image={product.image}
        path={`/products/${product.slug}`}
        title={product.name}
      />
      <PageHero
        breadcrumbs={[{ label: "Products", path: "/products" }, { label: product.name }]}
        description={product.shortDescription}
        eyebrow={product.category}
        image={product.image}
        title={product.name}
      />
      <section className="section-padding bg-white">
        <div className="site-container">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <div className="overflow-hidden rounded-[2rem] bg-mint shadow-soft">
                <img
                  alt={`${product.name} gallery visual`}
                  className={galleryImageClass}
                  loading="eager"
                  src={activeImage}
                />
              </div>
              <div className="mt-4 grid grid-cols-4 gap-3">
                {gallery.map((image) => (
                  <button
                    aria-label={`View ${product.name} image`}
                    className={`overflow-hidden rounded-2xl border-2 ${
                      image === activeImage ? "border-forest" : "border-transparent"
                    }`}
                    key={image}
                    onClick={() => setSelectedImage(image)}
                    type="button"
                  >
                    <img alt="" className={thumbnailImageClass} src={image} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Badge>{product.category}</Badge>
              <h2 className="mt-4 text-3xl font-extrabold text-ink sm:text-4xl">{t(product.name)}</h2>
              <p className="mt-4 text-base leading-8 text-muted">{t(product.description)}</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-mint p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">{t("Pack / Unit")}</p>
                  <p className="mt-2 font-extrabold text-forest">{product.packSize}</p>
                </div>
                <div className="rounded-2xl bg-mint p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">{t("Form")}</p>
                  <p className="mt-2 font-extrabold text-forest">{t(product.unit)}</p>
                </div>
                <div className="rounded-2xl bg-mint p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">{t("Availability")}</p>
                  <p className="mt-2 font-extrabold text-forest">{t("On Enquiry")}</p>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button to={`/enquiry?product=${product.slug}`} icon="ArrowRight">
                  Enquire About Product
                </Button>
                <Button href={`tel:${companyConfig.phone}`} variant="secondary">
                  Call Now
                </Button>
                <Button
                  href={buildWhatsAppUrl(t("Hello KN Agro, I would like to know more about {{product}}.", { product: product.name }))}
                  rel="noreferrer"
                  target="_blank"
                  variant="secondary"
                >
                  WhatsApp
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            <InfoPanel title="Main Benefits" items={product.benefits} />
            <InfoPanel title="Application / Usage" items={product.applications} />
            <InfoPanel title="Suitable Crops" items={product.suitableCrops} />
          </div>

          <div className="mt-10 rounded-2xl border border-forest/10 bg-mint p-6">
            <h3 className="text-xl font-extrabold text-ink">{t("Technical / Product Information")}</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {product.technicalInfo.map((item) => (
                <div className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-forest" key={item}>
                  {t(item)}
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm leading-6 text-muted">
              {t(
                "Exact application method and dosage should be finalized according to crop, soil condition and field advice.",
              )}
            </p>
          </div>

          <div className="mt-14">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow">{t("Related Products")}</p>
                <h2 className="mt-3 text-3xl font-extrabold text-ink">
                  {t("More from {{category}}", { category: t(product.category) })}
                </h2>
              </div>
              <Link className="font-bold text-forest hover:underline" to={`/categories/${product.categorySlug}`}>
                {t("View category")}
              </Link>
            </div>
            <div className="mt-8">
              <ProductGrid isLoading={relatedState.isLoading} products={relatedState.data || []} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function InfoPanel({ title, items }) {
  const { t } = useLanguage();

  return (
    <article className="rounded-2xl border border-forest/10 bg-white p-6 shadow-card">
      <h3 className="text-lg font-extrabold text-ink">{t(title)}</h3>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li className="flex items-start gap-3 text-sm font-semibold text-muted" key={item}>
            <Icon name="CheckCircle2" className="mt-0.5 h-5 w-5 shrink-0 text-agriculture" />
            {t(item)}
          </li>
        ))}
      </ul>
    </article>
  );
}
