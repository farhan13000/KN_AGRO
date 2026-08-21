import Icon from "../../../../shared/components/Icon";
import { useLanguage } from "../../../../i18n/LanguageContext";

export default function TestimonialsSection({ testimonials = [] }) {
  const { t } = useLanguage();

  return (
    <section className="bg-white py-14">
      <div className="site-container">
        <div className="text-center">
          <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-agriculture">
            {t("What Our Customers Say")}
          </p>
          <h2 className="mt-3 text-3xl font-black leading-tight text-ink sm:text-4xl">
            {t("Trusted by Farmers, Chosen for Results")}
          </h2>
          <Icon name="Leaf" className="mx-auto mt-3 h-5 w-5 fill-current text-agriculture" />
        </div>

        <div className="relative mt-10">
          <button
            aria-label="Previous testimonials"
            className="absolute -left-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-mint text-forest shadow-card md:flex"
            type="button"
          >
            <Icon name="ChevronRight" className="h-5 w-5 rotate-180" />
          </button>
          <div className="grid gap-6 lg:grid-cols-3">
            {testimonials.slice(0, 3).map((testimonial) => (
              <article className="rounded-xl border border-forest/10 bg-white p-6 shadow-card" key={testimonial.id}>
                <Icon name="Quote" className="h-10 w-10 text-leaf" strokeWidth={1.5} />
                <p className="mt-4 min-h-24 text-sm leading-7 text-ink/78">"{t(testimonial.feedback)}"</p>
                <div className="mt-6 flex items-center gap-4">
                  <img
                    alt={`${testimonial.name} testimonial avatar`}
                    className="h-12 w-12 rounded-full object-cover"
                    loading="lazy"
                    src={testimonial.avatar}
                  />
                  <div>
                    <p className="font-extrabold text-ink">- {testimonial.name}</p>
                    <p className="text-sm text-muted">
                      {t(testimonial.role)}, {t(testimonial.location)}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <button
            aria-label="Next testimonials"
            className="absolute -right-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-mint text-forest shadow-card md:flex"
            type="button"
          >
            <Icon name="ChevronRight" className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-8 flex justify-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-agriculture" />
          <span className="h-2.5 w-2.5 rounded-full bg-forest/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-forest/20" />
        </div>
      </div>
    </section>
  );
}
