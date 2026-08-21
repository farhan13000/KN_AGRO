import { useLanguage } from "../../i18n/LanguageContext";
import Button from "./Button";
import Icon from "./Icon";

export default function CTASection({
  title = "Looking for the Right Agricultural Products?",
  description = "Connect with KN Agro for product information, availability and business enquiries.",
  primaryLabel = "Send Enquiry",
  primaryTo = "/enquiry",
  secondaryLabel = "Contact Us",
  secondaryTo = "/contact",
}) {
  const { t } = useLanguage();

  return (
    <section className="bg-[#064d1f] text-white">
      <div className="site-container">
        <div className="grid items-center gap-8 border-b border-white/10 py-8 lg:grid-cols-[0.5fr_1fr_0.75fr]">
          <div className="flex items-center gap-4">
            <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white text-agriculture shadow-card">
              <Icon name="Leaf" className="h-11 w-11" strokeWidth={1.7} />
            </span>
            <h2 className="text-xl font-black leading-tight">{t("Let's Grow Better, Together")}</h2>
          </div>
          <div>
            <h3 className="text-2xl font-black leading-tight">{t(title)}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/78">{t(description)}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <Button className="rounded-lg bg-white text-forest hover:bg-mint" to={primaryTo} variant="secondary" icon="ArrowRight">
              {primaryLabel}
            </Button>
            <Button className="rounded-lg border border-white/60 bg-transparent text-white hover:bg-white/10" to={secondaryTo} variant="ghost" icon="ArrowRight">
              {secondaryLabel}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
