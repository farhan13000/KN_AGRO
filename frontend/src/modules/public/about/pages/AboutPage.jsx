import BenefitCard from "../../../../shared/components/BenefitCard";
import Button from "../../../../shared/components/Button";
import Icon from "../../../../shared/components/Icon";
import PageHero from "../../../../shared/components/PageHero";
import SEO from "../../../../shared/components/SEO";
import SectionHeading from "../../../../shared/components/SectionHeading";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { categories } from "../../data/categories.data";
import { businessAdvantages, companyValues, heroImages, productBenefits } from "../../data/company.data";

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <>
      <SEO
        description="Learn about KN Agro, a professional supplier and trader of agricultural inputs including bio fertilizers, organic fertilizers, micronutrients and crop nutrition products."
        image={heroImages.seedlings}
        path="/about"
        title="About Us"
      />
      <PageHero
        breadcrumbs={[{ label: "About Us" }]}
        description="KN Agro focuses on practical agricultural product supply, clear catalogue information and reliable business enquiry support."
        eyebrow="About KN Agro"
        image={heroImages.seedlings}
        title="Reliable Agricultural Product Supply with a Practical Field Focus"
      />

      <section className="section-padding bg-white">
        <div className="site-container grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative">
            <img
              alt="Agricultural field representing KN Agro product supply"
              className="aspect-[5/4] rounded-[2rem] object-cover shadow-soft"
              loading="lazy"
              src={heroImages.field}
            />
            <div className="absolute -bottom-6 left-6 right-6 rounded-2xl bg-white p-5 shadow-soft">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-agriculture">{t("Our Business")}</p>
              <p className="mt-2 text-xl font-extrabold text-ink">
                {t("Catalogue-led supply for farmers, dealers and agri customers.")}
              </p>
            </div>
          </div>
          <div>
            <p className="eyebrow">{t("Company Story")}</p>
            <h2 className="mt-4 text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
              {t("A clean, professional product experience for agricultural inputs.")}
            </h2>
            <p className="mt-5 text-base leading-8 text-muted">
              {t(
                "KN Agro is built around the everyday needs of agricultural customers: discovering relevant products, understanding their category and pack options, and sending a clear enquiry without unnecessary complexity. The company product range focuses on bio fertilizers, organic inputs, micronutrients, plant growth promoters, soil conditioners and related agro products.",
              )}
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-mint p-5">
                <h3 className="font-extrabold text-forest">{t("Mission")}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {t(
                    "Help customers access useful agricultural products through clear information and responsive enquiry support.",
                  )}
                </p>
              </div>
              <div className="rounded-2xl bg-mint p-5">
                <h3 className="font-extrabold text-forest">{t("Vision")}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {t("Build a dependable agricultural product platform that supports better crop and soil decisions.")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="site-container">
          <SectionHeading
            eyebrow="What We Do"
            title="Focused Product Range for Crop and Soil Requirements"
            description="The public catalogue is structured so customers can quickly understand the product category, intended benefits and enquiry path."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.slice(0, 8).map((category) => (
              <div className="rounded-2xl border border-forest/10 bg-white p-5 shadow-card" key={category.id}>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mint text-forest">
                  <Icon name={category.icon} />
                </span>
                <h3 className="mt-5 text-lg font-extrabold text-ink">{t(category.name)}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{t(category.description)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-mint">
        <div className="site-container">
          <SectionHeading
            eyebrow="Business Values"
            title="Simple Values for Long-Term Agricultural Relationships"
            description="KN Agro avoids exaggerated claims and keeps the customer experience grounded in clarity, reliability and practical support."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {companyValues.map((value) => (
              <article className="rounded-2xl bg-white p-6 shadow-card" key={value.title}>
                <h3 className="text-xl font-extrabold text-forest">{t(value.title)}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{t(value.description)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="site-container grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="eyebrow">{t("Service Strength")}</p>
            <h2 className="mt-4 text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
              {t("Product information, category clarity and responsive enquiry support.")}
            </h2>
            <p className="mt-5 text-base leading-8 text-muted">
              {t(
                "Customers should be able to browse the product range, understand what each product is for and quickly connect with KN Agro for availability, pack options and business requirements.",
              )}
            </p>
            <Button className="mt-8" to="/enquiry" icon="ArrowRight">
              Send Product Enquiry
            </Button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {productBenefits.slice(0, 4).map((benefit) => (
              <BenefitCard
                description={benefit.description}
                icon={benefit.icon}
                key={benefit.title}
                title={benefit.title}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="site-container">
          <SectionHeading
            eyebrow="Why Choose KN Agro"
            title="Professional, Agriculture-Focused and Enquiry Ready"
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {businessAdvantages.map((item) => (
              <BenefitCard description={item.description} icon={item.icon} key={item.title} title={item.title} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
