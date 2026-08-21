import { companyConfig } from "../../config/company.config";
import { useLanguage } from "../../i18n/LanguageContext";
import Icon from "../components/Icon";

export default function TopContactBar() {
  const { t } = useLanguage();

  return (
    <div className="hidden border-b border-white/10 bg-[#064d1f] text-white sm:block">
      <div className="site-container flex min-h-9 items-center justify-between gap-4 text-xs font-semibold">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-white/82">
          <a className="inline-flex items-center gap-2 hover:text-white" href={`tel:${companyConfig.phone}`}>
            <Icon name="Phone" className="h-3.5 w-3.5" />
            {companyConfig.phone}
          </a>
          <a className="inline-flex items-center gap-2 hover:text-white" href={`mailto:${companyConfig.email}`}>
            <Icon name="Mail" className="h-3.5 w-3.5" />
            {companyConfig.email}
          </a>
          <span className="inline-flex items-center gap-2">
            <Icon name="Clock" className="h-3.5 w-3.5" />
            {t(companyConfig.businessHours)}
          </span>
        </div>
        <div className="flex items-center gap-4 text-white/82">
          <a aria-label="Facebook" className="hover:text-white" href={companyConfig.social.facebook}>
            <Icon name="Facebook" className="h-3.5 w-3.5" />
          </a>
          <a aria-label="Instagram" className="hover:text-white" href={companyConfig.social.instagram}>
            <Icon name="Instagram" className="h-3.5 w-3.5" />
          </a>
          <a aria-label="WhatsApp" className="hover:text-white" href={`https://wa.me/${companyConfig.whatsapp}`}>
            <Icon name="MessageCircle" className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
