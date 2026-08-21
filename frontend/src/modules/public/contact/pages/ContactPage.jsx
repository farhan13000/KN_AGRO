import ContactCard from "../../../../shared/components/ContactCard";
import PageHero from "../../../../shared/components/PageHero";
import SEO from "../../../../shared/components/SEO";
import { companyConfig } from "../../../../config/company.config";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { buildWhatsAppUrl } from "../../../../utils/whatsapp";
import { heroImages } from "../../data/company.data";
import ContactForm from "../components/ContactForm";

export default function ContactPage() {
  const { t } = useLanguage();

  return (
    <>
      <SEO
        description="Contact KN Agro for agricultural product information, availability, business enquiries and product catalogue support."
        image={heroImages.field}
        path="/contact"
        title="Contact"
      />
      <PageHero
        breadcrumbs={[{ label: "Contact" }]}
        description="Reach KN Agro for product information, supply conversations, availability and agricultural input enquiries."
        eyebrow="Contact KN Agro"
        image={heroImages.field}
        title="Let Us Help with Your Agricultural Product Requirement"
      />

      <section className="section-padding bg-white">
        <div className="site-container grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="eyebrow">{t("Contact Information")}</p>
            <h2 className="mt-4 text-3xl font-extrabold leading-tight text-ink">{t("Quick ways to reach KN Agro.")}</h2>
            <p className="mt-4 text-base leading-8 text-muted">
              {t(
                "Share your product requirement, category interest or business enquiry. The current form simulates a successful submission and is ready for backend integration.",
              )}
            </p>
            <div className="mt-8 grid gap-4">
              <ContactCard href={`tel:${companyConfig.phone}`} icon="Phone" title="Phone">
                {companyConfig.phone}
              </ContactCard>
              <ContactCard href={`mailto:${companyConfig.email}`} icon="Mail" title="Email">
                {companyConfig.email}
              </ContactCard>
              <ContactCard
                href={buildWhatsAppUrl(t("Hello KN Agro, I would like to discuss an agricultural product requirement."))}
                icon="MessageCircle"
                title="WhatsApp"
              >
                Chat for product information and availability.
              </ContactCard>
              <ContactCard icon="MapPin" title="Address">
                {companyConfig.address}
              </ContactCard>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>

      <section className="section-padding">
        <div className="site-container grid gap-8 lg:grid-cols-[1fr_0.55fr]">
          <div className="overflow-hidden rounded-[2rem] border border-forest/10 bg-white shadow-card">
            <iframe
              className="h-[380px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={companyConfig.mapEmbedUrl}
              title="KN Agro map location"
            />
          </div>
          <div className="rounded-[2rem] bg-forest p-8 text-white shadow-soft">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-mustard">{t("Business Hours")}</p>
            <h2 className="mt-4 text-3xl font-extrabold">{t("Plan your enquiry during working hours.")}</h2>
            <p className="mt-5 text-white/78">{t(companyConfig.businessHours)}</p>
            <div className="mt-8 rounded-2xl bg-white/10 p-5 text-sm leading-7 text-white/80">
              {t(
                "For urgent product details, WhatsApp is the quickest contact option. Backend delivery channels can be connected in the next phase.",
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
