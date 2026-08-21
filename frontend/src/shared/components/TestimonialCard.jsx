import { useLanguage } from "../../i18n/LanguageContext";
import Icon from "./Icon";

export default function TestimonialCard({ testimonial }) {
  const { t } = useLanguage();

  return (
    <article className="rounded-2xl border border-forest/10 bg-white p-6 shadow-card">
      <div className="flex gap-1 text-mustard">
        {Array.from({ length: 5 }).map((_, index) => (
          <Icon className="h-4 w-4 fill-current" key={index} name="Star" />
        ))}
      </div>
      <p className="mt-5 text-sm leading-7 text-muted">"{t(testimonial.feedback)}"</p>
      <div className="mt-6 border-t border-forest/10 pt-5">
        <p className="font-extrabold text-ink">{testimonial.name}</p>
        <p className="mt-1 text-sm text-muted">
          {t(testimonial.role)}, {t(testimonial.location)}
        </p>
      </div>
    </article>
  );
}
