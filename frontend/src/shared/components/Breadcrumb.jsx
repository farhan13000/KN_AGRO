import { Link } from "react-router-dom";
import { useLanguage } from "../../i18n/LanguageContext";
import Icon from "./Icon";

export default function Breadcrumb({ items = [], inverted = false }) {
  const { t } = useLanguage();
  if (!items.length) return null;

  const color = inverted ? "text-white/78" : "text-muted";
  const activeColor = inverted ? "text-white" : "text-forest";

  return (
    <nav aria-label="Breadcrumb" className={`flex flex-wrap items-center gap-2 text-sm ${color}`}>
      <Link className="font-semibold hover:underline" to="/">
        {t("Home")}
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span className="inline-flex items-center gap-2" key={`${item.label}-${item.path || index}`}>
            <Icon name="ChevronRight" className="h-4 w-4" />
            {isLast || !item.path ? (
              <span className={`font-semibold ${activeColor}`}>{t(item.label)}</span>
            ) : (
              <Link className="font-semibold hover:underline" to={item.path}>
                {t(item.label)}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
