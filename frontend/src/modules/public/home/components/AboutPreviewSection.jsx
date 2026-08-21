import Button from "../../../../shared/components/Button";
import Icon from "../../../../shared/components/Icon";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { heroImages } from "../../data/company.data";

export default function AboutPreviewSection() {
  const { t } = useLanguage();

  return (
    <section className="bg-white py-10">
      <div className="site-container grid items-center gap-12 lg:grid-cols-[1fr_0.95fr]">
        <div className="overflow-hidden rounded-xl shadow-soft">
          <img
            alt="Tractor working in a green agricultural field at sunset"
            className="aspect-[1.55] w-full object-cover"
            loading="lazy"
            src={heroImages.tractor}
          />
        </div>

        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-agriculture">{t("About KN Agro")}</p>
          <h2 className="mt-3 text-3xl font-black leading-tight text-ink sm:text-4xl">
            {t("Growing Together for a Better Tomorrow")}
          </h2>
          <p className="mt-5 text-sm leading-7 text-muted">
            {t(
              "KN Agro is a trusted name in the field of agricultural inputs. We are dedicated to improving soil health and crop productivity through high quality, effective and eco-friendly products.",
            )}
          </p>

          <div className="mt-7 space-y-5">
            <div className="flex gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-mint text-agriculture">
                <Icon name="Sprout" />
              </span>
              <div>
                <h3 className="font-extrabold text-ink">{t("Our Mission")}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">
                  {t(
                    "To provide innovative and quality agricultural solutions that empower farmers and enhance productivity.",
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-mint text-agriculture">
                <Icon name="Handshake" />
              </span>
              <div>
                <h3 className="font-extrabold text-ink">{t("Our Approach")}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">
                  {t("We focus on quality, research and customer satisfaction to deliver the best results in every field.")}
                </p>
              </div>
            </div>
          </div>

          <Button className="mt-7 rounded-lg" to="/about" icon="ArrowRight">
            Read More About Us
          </Button>
        </div>
      </div>
    </section>
  );
}
