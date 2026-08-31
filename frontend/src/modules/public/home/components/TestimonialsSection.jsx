import { useState } from "react";
import Icon from "../../../../shared/components/Icon";
import { useLanguage } from "../../../../i18n/LanguageContext";

const perPage = 3;

export default function TestimonialsSection({ testimonials = [] }) {
  const { t } = useLanguage();
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(testimonials.length / perPage));
  const activePage = Math.min(page, pageCount - 1);
  const visibleTestimonials = testimonials.slice(activePage * perPage, activePage * perPage + perPage);

  const goToPage = (nextPage) => setPage((nextPage + pageCount) % pageCount);

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
          {pageCount > 1 ? (
            <button
              aria-label="Previous testimonials"
              className="absolute -left-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-mint text-forest shadow-card md:flex"
              onClick={() => goToPage(activePage - 1)}
              type="button"
            >
              <Icon name="ChevronRight" className="h-5 w-5 rotate-180" />
            </button>
          ) : null}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleTestimonials.map((testimonial) => (
              <article className="rounded-xl border border-forest/10 bg-white p-6 shadow-card" key={testimonial.id}>
                <Icon name="Quote" className="h-10 w-10 text-leaf" strokeWidth={1.5} />
                <p className="mt-4 min-h-24 text-sm leading-7 text-ink/78">"{t(testimonial.feedback)}"</p>
                <div className="mt-6 flex items-center gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-mint text-sm font-black text-forest">
                    {testimonial.initials}
                  </span>
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
          {pageCount > 1 ? (
            <button
              aria-label="Next testimonials"
              className="absolute -right-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-mint text-forest shadow-card md:flex"
              onClick={() => goToPage(activePage + 1)}
              type="button"
            >
              <Icon name="ChevronRight" className="h-5 w-5" />
            </button>
          ) : null}
        </div>

        {pageCount > 1 ? (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: pageCount }).map((_, index) => (
              <button
                aria-label={`Go to testimonials page ${index + 1}`}
                className={`h-2.5 w-2.5 rounded-full transition ${
                  index === activePage ? "bg-agriculture" : "bg-forest/20"
                }`}
                key={index}
                onClick={() => goToPage(index)}
                type="button"
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
