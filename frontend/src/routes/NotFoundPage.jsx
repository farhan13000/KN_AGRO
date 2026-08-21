import Button from "../shared/components/Button";
import Icon from "../shared/components/Icon";
import SEO from "../shared/components/SEO";
import { useLanguage } from "../i18n/LanguageContext";

export default function NotFoundPage() {
  const { t } = useLanguage();

  return (
    <>
      <SEO
        description="The page you requested could not be found on the KN Agro public website."
        path="/404"
        title="Page Not Found"
      />
      <section className="site-container flex min-h-[70vh] items-center py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-mint text-forest">
            <Icon name="Leaf" className="h-8 w-8" />
          </span>
          <p className="mt-6 text-sm font-bold uppercase tracking-[0.18em] text-agriculture">{t("404 Not Found")}</p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight text-ink sm:text-5xl">
            {t("This page is not in the KN Agro catalogue.")}
          </h1>
          <p className="mt-5 text-base leading-8 text-muted">
            {t("The link may have changed, or the product/category you are looking for may be unavailable.")}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button to="/products" icon="ArrowRight">
              Browse Products
            </Button>
            <Button to="/contact" variant="secondary">
              Contact KN Agro
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
