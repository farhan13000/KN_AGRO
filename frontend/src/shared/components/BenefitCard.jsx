import { useLanguage } from "../../i18n/LanguageContext";
import Icon from "./Icon";

export default function BenefitCard({ icon, title, description }) {
  const { t } = useLanguage();

  return (
    <article className="rounded-2xl border border-forest/10 bg-white p-6 shadow-card">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mint text-forest">
        <Icon name={icon} />
      </div>
      <h3 className="mt-5 text-lg font-extrabold text-ink">{t(title)}</h3>
      <p className="mt-3 text-sm leading-6 text-muted">{t(description)}</p>
    </article>
  );
}
