import { Helmet } from "react-helmet-async";
import { companyConfig } from "../../config/company.config";
import { useLanguage } from "../../i18n/LanguageContext";

const siteUrl = import.meta.env.VITE_PUBLIC_SITE_URL || "http://localhost:5173";

export default function SEO({ title, description, path = "/", image }) {
  const { t, language } = useLanguage();
  const localizedTitle = title ? t(title) : companyConfig.name;
  const localizedDescription = t(description);
  const pageTitle = title ? `${localizedTitle} | ${companyConfig.name}` : companyConfig.name;
  const canonicalUrl = `${siteUrl}${path}`;

  return (
    <Helmet>
      <html lang={language} />
      <title>{pageTitle}</title>
      <meta name="description" content={localizedDescription} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={localizedDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      {image ? <meta property="og:image" content={image} /> : null}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={localizedDescription} />
      {image ? <meta name="twitter:image" content={image} /> : null}
    </Helmet>
  );
}
