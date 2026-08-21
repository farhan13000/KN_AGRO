import { useParams } from "react-router-dom";
import BenefitCard from "../../../../shared/components/BenefitCard";
import EmptyState from "../../../../shared/components/EmptyState";
import PageHero from "../../../../shared/components/PageHero";
import ProductGrid from "../../../../shared/components/ProductGrid";
import SEO from "../../../../shared/components/SEO";
import { usePublicData } from "../../../../hooks/usePublicData";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { publicProductsApi } from "../../products/api/publicProducts.api";
import { publicCategoriesApi } from "../api/publicCategories.api";

export default function CategoryDetailsPage() {
  const { t } = useLanguage();
  const { slug } = useParams();
  const categoryState = usePublicData(() => publicCategoriesApi.getCategoryBySlug(slug), [slug]);
  const productState = usePublicData(() => publicProductsApi.getProductsByCategory(slug), [slug]);
  const category = categoryState.data;

  if (categoryState.isLoading) {
    return (
      <section className="site-container py-20">
        <div className="animate-pulse rounded-[2rem] bg-white p-10 shadow-card">
          <div className="h-7 w-32 rounded bg-mint" />
          <div className="mt-5 h-12 w-3/4 rounded bg-mint" />
          <div className="mt-5 h-5 w-2/3 rounded bg-mint" />
        </div>
      </section>
    );
  }

  if (!category) {
    return (
      <>
        <SEO description="The requested KN Agro category could not be found." path={`/categories/${slug}`} title="Category Not Found" />
        <PageHero
          breadcrumbs={[{ label: "Categories", path: "/categories" }, { label: "Not Found" }]}
          description="This category may be unavailable or the link may have changed."
          eyebrow="Product Categories"
          title="Category Not Found"
        />
        <section className="site-container py-16">
          <EmptyState
            actionLabel="Browse Categories"
            actionTo="/categories"
            description="Explore all product categories or send an enquiry for product support."
            title="We could not find this category"
          />
        </section>
      </>
    );
  }

  return (
    <>
      <SEO
        description={category.description}
        image={category.image}
        path={`/categories/${category.slug}`}
        title={category.name}
      />
      <PageHero
        breadcrumbs={[{ label: "Categories", path: "/categories" }, { label: category.name }]}
        description={category.description}
        eyebrow="Product Category"
        image={category.image}
        title={category.name}
      />
      <section className="section-padding bg-white">
        <div className="site-container">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-[2rem] bg-mint p-6">
              <img
                alt={`${category.name} agricultural category`}
                className="aspect-[4/3] rounded-2xl object-cover shadow-card"
                loading="lazy"
                src={category.image}
              />
            </div>
            <div>
              <p className="eyebrow">{t("Benefits / Uses")}</p>
              <h2 className="mt-4 text-3xl font-extrabold text-ink sm:text-4xl">
                {t("Practical support from the {{category}} range.", { category: t(category.name) })}
              </h2>
              <p className="mt-4 text-base leading-8 text-muted">{t(category.description)}</p>
              <div className="mt-8 grid gap-5 sm:grid-cols-3">
                {category.benefits.map((benefit) => (
                  <BenefitCard
                    description="This benefit is represented as catalogue guidance and can be replaced with product-specific technical details."
                    icon={category.icon}
                    key={benefit}
                    title={benefit}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-16">
            <div className="max-w-3xl">
              <p className="eyebrow">{t("Products Under Category")}</p>
              <h2 className="mt-4 text-3xl font-extrabold text-ink">
                {t("Explore {{category}}", { category: t(category.name) })}
              </h2>
              <p className="mt-4 text-base leading-7 text-muted">
                {t(
                  "These products are loaded through the public product service layer and can later connect directly to backend category APIs.",
                )}
              </p>
            </div>
            <div className="mt-10">
              <ProductGrid isLoading={productState.isLoading} products={productState.data || []} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
