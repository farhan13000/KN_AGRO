import { useLanguage } from "../../i18n/LanguageContext";
import Breadcrumb from "./Breadcrumb";

export default function PageHero({ eyebrow, title, description, breadcrumbs = [], image }) {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-forest text-white">
      {image ? (
        <img
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-20"
          loading="eager"
          src={image}
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-r from-forest via-forest/92 to-agriculture/80" />
      <div className="site-container relative py-16 sm:py-20 lg:py-24">
        <Breadcrumb items={breadcrumbs} inverted />
        {eyebrow ? <p className="mt-8 text-sm font-bold uppercase tracking-[0.18em] text-mustard">{t(eyebrow)}</p> : null}
        <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">{t(title)}</h1>
        {description ? <p className="mt-5 max-w-2xl text-lg leading-8 text-white/82">{t(description)}</p> : null}
      </div>
    </section>
  );
}
