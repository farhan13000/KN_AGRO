import ContactCard from "../../../../shared/components/ContactCard";
import EmptyState from "../../../../shared/components/EmptyState";
import PageHero from "../../../../shared/components/PageHero";
import SEO from "../../../../shared/components/SEO";
import SkeletonCard from "../../../../shared/components/SkeletonCard";
import { companyConfig } from "../../../../config/company.config";
import { usePublicData } from "../../../../hooks/usePublicData";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { buildWhatsAppUrl } from "../../../../utils/whatsapp";
import { publicCategoriesApi } from "../../categories/api/publicCategories.api";
import { heroImages } from "../../data/company.data";
import { publicProductsApi } from "../../products/api/publicProducts.api";
import EnquiryForm from "../components/EnquiryForm";

export default function EnquiryPage() {
  const { t } = useLanguage();
  const productState = usePublicData(publicProductsApi.getProducts, []);
  const categoryState = usePublicData(publicCategoriesApi.getCategories, []);
  const isLoading = productState.isLoading || categoryState.isLoading;
  const isError = productState.isError || categoryState.isError;

  return (
    <>
      <SEO
        description="Send a KN Agro product enquiry for agricultural inputs, availability, category information and business supply requirements."
        image={heroImages.soil}
        path="/enquiry"
        title="Send Enquiry"
      />
      <PageHero
        breadcrumbs={[{ label: "Send Enquiry" }]}
        description="Share your product, category, quantity and contact preference. KN Agro can use this flow for backend enquiry management in the next phase."
        eyebrow="Product Enquiry"
        image={heroImages.soil}
        title="Request Product Information and Availability"
      />
      <section className="section-padding bg-white">
        <div className="site-container grid gap-10 lg:grid-cols-[0.78fr_1.22fr]">
          <div>
            <p className="eyebrow">{t("Enquiry Support")}</p>
            <h2 className="mt-4 text-3xl font-extrabold leading-tight text-ink">
              {t("Tell us what agricultural product you need.")}
            </h2>
            <p className="mt-4 text-base leading-8 text-muted">
              {t(
                "The form is built for catalogue enquiries, dealer requirements and product availability requests. It validates on the frontend and keeps the API integration isolated.",
              )}
            </p>
            <div className="mt-8 grid gap-4">
              <ContactCard href={`tel:${companyConfig.phone}`} icon="Phone" title="Call">
                {companyConfig.phone}
              </ContactCard>
              <ContactCard
                href={buildWhatsAppUrl(t("Hello KN Agro, I want to send an agricultural product enquiry."))}
                icon="MessageCircle"
                title="WhatsApp"
              >
                Quick enquiry conversation.
              </ContactCard>
              <ContactCard href={`mailto:${companyConfig.email}`} icon="Mail" title="Email">
                {companyConfig.email}
              </ContactCard>
            </div>
          </div>
          {isLoading ? (
            <SkeletonCard />
          ) : isError ? (
            <EmptyState
              description={productState.error || categoryState.error}
              title="Unable to prepare enquiry form"
            />
          ) : (
            <EnquiryForm categories={categoryState.data || []} products={productState.data || []} />
          )}
        </div>
      </section>
    </>
  );
}
