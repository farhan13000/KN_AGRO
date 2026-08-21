import Button from "../../../../shared/components/Button";
import Icon from "../../../../shared/components/Icon";
import { useLanguage } from "../../../../i18n/LanguageContext";

export default function WhyChooseSection({ advantages = [] }) {
  const { t } = useLanguage();

  return (
    <section className="bg-white py-10">
      <div className="site-container">
        <div className="grid gap-8 rounded-xl bg-gradient-to-r from-[#f4f5e9] to-[#eef5e9] p-8 shadow-card lg:grid-cols-[0.9fr_1.6fr] lg:p-10">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-agriculture">
              {t("Why Choose KN Agro?")}
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-ink sm:text-4xl">
              {t("Our Commitment")}
              <span className="block">{t("Your Growth")}</span>
            </h2>
            <Icon name="Leaf" className="mt-4 h-5 w-5 fill-current text-agriculture" />
            <p className="mt-5 text-sm leading-7 text-muted">
              {t(
                "We provide reliable agricultural solutions that help farmers achieve higher productivity sustainably and profitably.",
              )}
            </p>
            <Button className="mt-6 rounded-lg" to="/about" icon="ArrowRight">
              Learn More About Us
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {advantages.map((item) => (
              <article className="text-center" key={item.title}>
                <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-agriculture shadow-sm ring-1 ring-forest/10">
                  <Icon name={item.icon} className="h-11 w-11" strokeWidth={1.6} />
                </span>
                <h3 className="mt-5 text-lg font-black leading-tight text-ink">{t(item.title)}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{t(item.description)}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
