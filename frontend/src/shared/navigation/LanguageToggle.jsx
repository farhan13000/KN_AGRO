import { languages, useLanguage } from "../../i18n/LanguageContext";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="inline-flex rounded-full border border-forest/10 bg-mint p-1" aria-label="Language selector">
      {languages.map((item) => (
        <button
          className={`min-h-9 rounded-full px-3 text-xs font-black transition ${
            language === item.code ? "bg-forest text-white shadow-sm" : "text-forest hover:bg-white"
          }`}
          key={item.code}
          onClick={() => setLanguage(item.code)}
          type="button"
        >
          {item.shortLabel}
        </button>
      ))}
    </div>
  );
}
