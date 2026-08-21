import { companyConfig } from "../../config/company.config";
import { useLanguage } from "../../i18n/LanguageContext";
import { buildWhatsAppUrl } from "../../utils/whatsapp";
import Icon from "../components/Icon";

export default function FloatingWhatsApp() {
  const { t } = useLanguage();

  return (
    <a
      aria-label="Chat with KN Agro on WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-soft transition hover:-translate-y-1"
      href={buildWhatsAppUrl(t("Hello KN Agro, I would like to know more about your agricultural products."))}
      rel="noreferrer"
      target="_blank"
    >
      <Icon name="MessageCircle" className="h-7 w-7" />
    </a>
  );
}
