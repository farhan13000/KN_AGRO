import LegalPageLayout from "../components/LegalPageLayout";
import { useLanguage } from "../../../../i18n/LanguageContext";

export default function TermsPage() {
  const { t } = useLanguage();

  return (
    <LegalPageLayout
      description="Terms and conditions for using the KN Agro public catalogue, product details and enquiry website."
      path="/terms"
      title="Terms & Conditions"
    >
      <h2>{t("Website Purpose")}</h2>
      <p>
        {t(
          "This website is a public product catalogue and enquiry platform for KN Agro. It is not an e-commerce checkout, payment system or final technical recommendation platform.",
        )}
      </p>
      <h2>{t("Product Information")}</h2>
      <p>
        {t(
          "Product descriptions, benefits, applications, crops and pack details are provided for general catalogue understanding. Final usage, dosage and suitability should be confirmed according to crop, soil, local conditions and professional agricultural advice.",
        )}
      </p>
      <h2>{t("Enquiries")}</h2>
      <p>
        {t(
          "Submitting an enquiry does not confirm stock availability, pricing, supply commitment or delivery timeline. KN Agro may contact the customer to clarify requirements before sharing final product information.",
        )}
      </p>
      <h2>{t("External Links")}</h2>
      <p>
        {t(
          "The site may include links for phone, email, WhatsApp, maps or social platforms. Those services are governed by their own policies and terms.",
        )}
      </p>
      <h2>{t("Updates")}</h2>
      <p>
        {t("KN Agro may update catalogue details, categories, contact information and these terms as the business website evolves.")}
      </p>
    </LegalPageLayout>
  );
}
