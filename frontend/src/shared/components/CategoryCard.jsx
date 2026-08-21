import { useLanguage } from "../../i18n/LanguageContext";
import Button from "./Button";
import Icon from "./Icon";

export default function CategoryCard({ category }) {
  const { t } = useLanguage();

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-forest/10 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-soft">
      <div className="relative aspect-[4/3] overflow-hidden bg-mint">
        <img
          alt={`${category.name} category visual`}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
          src={category.image}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest/75 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-forest shadow-card">
          <Icon name={category.icon} />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-extrabold text-ink">{t(category.name)}</h3>
          <span className="shrink-0 rounded-full bg-mint px-3 py-1 text-xs font-bold text-forest">
            {category.productCount || 0} {t("Products")}
          </span>
        </div>
        <p className="mt-3 flex-1 text-sm leading-6 text-muted">{t(category.description)}</p>
        <Button className="mt-5" to={`/categories/${category.slug}`} variant="secondary" icon="ArrowRight">
          Explore Category
        </Button>
      </div>
    </article>
  );
}
