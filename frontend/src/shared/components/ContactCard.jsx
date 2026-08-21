import { useLanguage } from "../../i18n/LanguageContext";
import Icon from "./Icon";

export default function ContactCard({ icon, title, children, href }) {
  const { t } = useLanguage();
  const content = (
    <div className="flex gap-4 rounded-2xl border border-forest/10 bg-white p-5 shadow-card transition hover:shadow-soft">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-mint text-forest">
        <Icon name={icon} />
      </div>
      <div>
        <h3 className="font-extrabold text-ink">{t(title)}</h3>
        <p className="mt-1 text-sm leading-6 text-muted">{typeof children === "string" ? t(children) : children}</p>
      </div>
    </div>
  );

  if (href) {
    return <a href={href}>{content}</a>;
  }

  return content;
}
