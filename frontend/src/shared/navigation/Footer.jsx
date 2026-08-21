import { Link } from "react-router-dom";
import { companyConfig } from "../../config/company.config";
import { categories } from "../../modules/public/data/categories.data";
import { footerQuickLinks } from "../../modules/public/data/navigation.data";
import logoImage from "../../assets/KN_AGRO_LOGO.png";
import { useLanguage } from "../../i18n/LanguageContext";
import Icon from "../components/Icon";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#064d1f] text-white">
      <div className="site-container grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-[1.15fr_0.75fr_0.85fr_1fr_1fr]">
        <div>
          <Link className="inline-flex rounded-2xl bg-white px-3 py-2" to="/" aria-label="KN Agro home">
            <img
              alt="KN Agro logo"
              className="h-16 w-auto object-contain"
              loading="lazy"
              src={logoImage}
            />
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-7 text-white/72">
            {t("Your trusted partner in agricultural growth. We provide quality inputs for better soil, better crops and better tomorrow.")}
          </p>
          <div className="mt-5 flex gap-3">
            {[
              ["Facebook", companyConfig.social.facebook],
              ["Instagram", companyConfig.social.instagram],
              ["Linkedin", companyConfig.social.linkedin],
            ].map(([icon, href]) => (
              <a
                aria-label={icon}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                href={href}
                key={icon}
              >
                <Icon name={icon} className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-[0.16em] text-mustard">{t("Quick Links")}</h2>
          <ul className="mt-5 space-y-3 text-sm text-white/76">
            {footerQuickLinks.map((item) => (
              <li key={item.path}>
                <Link className="hover:text-white" to={item.path}>
                  {t(item.label)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-[0.16em] text-mustard">{t("Product Categories")}</h2>
          <ul className="mt-5 space-y-3 text-sm text-white/76">
            {categories.slice(0, 6).map((category) => (
              <li key={category.slug}>
                <Link className="hover:text-white" to={`/categories/${category.slug}`}>
                  {t(category.name)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-[0.16em] text-mustard">{t("Contact")}</h2>
          <ul className="mt-5 space-y-4 text-sm text-white/76">
            <li className="flex gap-3">
              <Icon name="Phone" className="mt-0.5 h-4 w-4 shrink-0 text-mustard" />
              <a className="hover:text-white" href={`tel:${companyConfig.phone}`}>
                {companyConfig.phone}
              </a>
            </li>
            <li className="flex gap-3">
              <Icon name="Mail" className="mt-0.5 h-4 w-4 shrink-0 text-mustard" />
              <a className="hover:text-white" href={`mailto:${companyConfig.email}`}>
                {companyConfig.email}
              </a>
            </li>
            <li className="flex gap-3">
              <Icon name="MapPin" className="mt-0.5 h-4 w-4 shrink-0 text-mustard" />
              <span>{companyConfig.address}</span>
            </li>
            <li className="flex gap-3">
              <Icon name="Clock" className="mt-0.5 h-4 w-4 shrink-0 text-mustard" />
              <span>{t(companyConfig.businessHours)}</span>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-[0.16em] text-white">{t("Newsletter")}</h2>
          <p className="mt-5 text-sm leading-6 text-white/72">
            {t("Subscribe for product updates and farming tips.")}
          </p>
          <form className="mt-5 flex rounded-lg bg-white p-1" onSubmit={(event) => event.preventDefault()}>
            <label className="sr-only" htmlFor="footer-email">
              Email
            </label>
            <input
              className="min-w-0 flex-1 rounded-md px-3 text-sm text-ink outline-none"
              id="footer-email"
              placeholder={t("Enter your email")}
              type="email"
            />
            <button
              aria-label="Subscribe"
              className="flex h-10 w-10 items-center justify-center rounded-md bg-forest text-white"
              type="submit"
            >
              <Icon name="Send" className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="site-container flex flex-col gap-4 py-5 text-sm text-white/66 sm:flex-row sm:items-center sm:justify-between">
          <p>{t("Copyright")} {new Date().getFullYear()} KN Agro. {t("All rights reserved.")}</p>
          <div className="flex gap-5">
            <Link className="hover:text-white" to="/privacy-policy">
              {t("Privacy Policy")}
            </Link>
            <Link className="hover:text-white" to="/terms">
              {t("Terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
