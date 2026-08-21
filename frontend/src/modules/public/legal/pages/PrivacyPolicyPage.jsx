import LegalPageLayout from "../components/LegalPageLayout";
import { useLanguage } from "../../../../i18n/LanguageContext";

export default function PrivacyPolicyPage() {
  const { t } = useLanguage();

  return (
    <LegalPageLayout
      description="Privacy information for visitors and customers using the KN Agro public catalogue and enquiry website."
      path="/privacy-policy"
      title="Privacy Policy"
    >
      <h2>{t("Information We Collect")}</h2>
      <p>
        {t(
          "KN Agro may collect details submitted through public forms, including name, phone number, email address, company or business name, location, product interest, category interest, quantity and message details.",
        )}
      </p>
      <h2>{t("How Information Is Used")}</h2>
      <p>
        {t(
          "Submitted information is used to respond to product enquiries, share availability details, support business communication and improve the public catalogue experience.",
        )}
      </p>
      <h2>{t("Data Sharing")}</h2>
      <p>
        {t(
          "KN Agro does not present this public frontend as a payment or checkout system. Enquiry details should only be shared with authorized team members or service providers when needed to respond to the request.",
        )}
      </p>
      <h2>{t("Security")}</h2>
      <p>
        {t(
          "The current frontend is prepared for backend integration. Once connected, enquiry and contact data should be handled with authentication, validation, role-based access and audit practices defined in the project rules.",
        )}
      </p>
      <h2>{t("Contact")}</h2>
      <p>
        {t("For privacy-related questions, contact KN Agro through the phone or email details provided on the Contact page.")}
      </p>
    </LegalPageLayout>
  );
}
