import { useLanguage } from "../../i18n/LanguageContext";

export default function Badge({ children, className = "" }) {
  const { t } = useLanguage();

  return (
    <span className={`inline-flex items-center rounded-full bg-mint px-3 py-1 text-xs font-bold text-forest ${className}`}>
      {typeof children === "string" ? t(children) : children}
    </span>
  );
}
