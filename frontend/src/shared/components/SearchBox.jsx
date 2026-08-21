import { useLanguage } from "../../i18n/LanguageContext";
import Icon from "./Icon";

export default function SearchBox({ value, onChange, placeholder = "Search", label = "Search" }) {
  const { t } = useLanguage();

  return (
    <label className="block">
      <span className="sr-only">{t(label)}</span>
      <span className="relative block">
        <Icon name="Search" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
        <input
          className="form-field pl-12"
          onChange={(event) => onChange(event.target.value)}
          placeholder={t(placeholder)}
          type="search"
          value={value}
        />
      </span>
    </label>
  );
}
