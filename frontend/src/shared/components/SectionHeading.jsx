import { useLanguage } from "../../i18n/LanguageContext";

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className = "",
}) {
  const { t } = useLanguage();
  const alignment = align === "left" ? "items-start text-left" : "items-center text-center";

  return (
    <div className={`mx-auto flex max-w-3xl flex-col gap-4 ${alignment} ${className}`}>
      {eyebrow ? <p className="eyebrow">{t(eyebrow)}</p> : null}
      <h2 className="text-3xl font-extrabold leading-tight text-ink sm:text-4xl lg:text-5xl">{t(title)}</h2>
      {description ? <p className="text-base leading-7 text-muted sm:text-lg">{t(description)}</p> : null}
    </div>
  );
}
