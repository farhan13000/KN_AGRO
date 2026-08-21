import { Link } from "react-router-dom";
import Icon from "../../../../shared/components/Icon";
import SectionHeading from "../../../../shared/components/SectionHeading";
import SkeletonCard from "../../../../shared/components/SkeletonCard";
import { useLanguage } from "../../../../i18n/LanguageContext";

const descriptions = {
  "bio-fertilizers": "Improve soil fertility naturally",
  "organic-fertilizers": "Nourish soil and support healthy crops",
  micronutrients: "Essential nutrients for optimal crop growth",
  "growth-promoters": "Enhance growth and increase yield",
  "soil-conditioners": "Improve soil structure and water retention",
  "compost-organic-products": "100% natural and eco-friendly",
};

export default function CategorySolutionsSection({ categories = [], isLoading = false }) {
  const { t } = useLanguage();

  return (
    <section className="bg-white pb-16 pt-24">
      <div className="site-container">
        <SectionHeading eyebrow="Our Categories" title="Solutions for Every Farming Need" />
        <div className="mx-auto mt-3 h-5 w-16 text-agriculture">
          <Icon name="Leaf" className="mx-auto h-5 w-5 fill-current" />
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)
            : categories.slice(0, 6).map((category) => (
                <Link
                  className="group flex min-h-64 flex-col items-center rounded-xl border border-forest/10 bg-[#fbfcf8] p-5 text-center shadow-card transition hover:-translate-y-1 hover:border-agriculture/30 hover:shadow-soft"
                  key={category.id}
                  to={`/categories/${category.slug}`}
                >
                  <span className="flex h-24 w-24 items-center justify-center rounded-full border border-forest/10 bg-white text-agriculture shadow-sm">
                    <Icon name={category.icon} className="h-12 w-12" strokeWidth={1.6} />
                  </span>
                  <h3 className="mt-5 text-base font-extrabold text-forest">{t(category.name)}</h3>
                  <p className="mt-2 min-h-10 text-xs leading-5 text-muted">
                    {t(descriptions[category.slug] || category.description)}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-2 pt-4 text-xs font-extrabold text-forest">
                    {t("View Products")}
                    <Icon name="ArrowRight" className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
}
