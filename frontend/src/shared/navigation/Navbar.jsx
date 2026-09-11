import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Download } from "lucide-react";
import { primaryNavigation } from "../../modules/public/data/navigation.data";
import logoImage from "../../assets/KN_AGRO_LOGO.png";
import { useLanguage } from "../../i18n/LanguageContext";
import { ROUTES } from "../constants";
import Button from "../components/Button";
import Icon from "../components/Icon";
import { useInstallPrompt } from "../hooks";
import LanguageToggle from "./LanguageToggle";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useLanguage();
  const location = useLocation();
  // Same hook as the portal sidebar: true only when the browser has
  // actually offered an install and the app is not already running
  // installed. So this never shows on iOS Safari (which offers no install
  // prompt at all) or inside the installed app itself.
  const { canInstall, promptInstall } = useInstallPrompt();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navClass = ({ isActive }) =>
    `relative inline-flex items-center gap-1 px-3 py-2 text-sm font-extrabold transition ${
      isActive ? "text-forest after:absolute after:bottom-0 after:left-3 after:h-0.5 after:w-8 after:bg-forest" : "text-ink hover:text-forest"
    }`;

  return (
    <header
      className={`sticky top-0 z-50 border-b border-forest/10 bg-white/95 backdrop-blur transition ${
        isScrolled ? "shadow-card" : ""
      }`}
    >
      <div className="site-container flex min-h-[82px] items-center justify-between gap-4">
        <Link className="flex items-center" to="/" aria-label="KN Agro home">
          <img
            alt="KN Agro logo"
            className="h-14 w-auto object-contain"
            loading="eager"
            src={logoImage}
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {primaryNavigation.map((item) => (
            <NavLink className={navClass} end={item.path === "/"} key={item.path} to={item.path}>
              {t(item.label)}
              {item.path === "/products" || item.path === "/categories" ? (
                <Icon name="ChevronDown" className="h-3.5 w-3.5" />
              ) : null}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageToggle />
          {canInstall ? (
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-mint px-4 py-3 text-sm font-bold text-forest ring-1 ring-forest/15 transition hover:bg-white"
              onClick={promptInstall}
              title={t("Install KN Agro as an app")}
              type="button"
            >
              <Download className="h-4 w-4" />
              {t("Install App")}
            </button>
          ) : null}
          {/* Staff entry point. Deliberately `secondary` so it never competes
              with the customer-facing enquiry CTA beside it. */}
          <Button className="rounded-lg px-5" to={ROUTES.AUTH.LOGIN} icon="LogIn" variant="secondary">
            Login
          </Button>
          <Button className="rounded-lg px-6" to="/enquiry" icon="ArrowRight">
            Request Enquiry
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          {canInstall ? (
            <button
              aria-label={t("Install App")}
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-forest px-3 text-xs font-bold text-white shadow-soft transition hover:bg-agriculture"
              onClick={promptInstall}
              type="button"
            >
              <Download className="h-4 w-4" />
              {t("Install")}
            </button>
          ) : null}
          <button
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation menu"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-mint text-forest"
            onClick={() => setIsMenuOpen((current) => !current)}
            type="button"
          >
            <Icon name={isMenuOpen ? "X" : "Menu"} />
          </button>
        </div>
      </div>

      {isMenuOpen ? (
        <div className="border-t border-forest/10 bg-white px-4 pb-5 pt-2 lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-2" aria-label="Mobile navigation">
            {primaryNavigation.map((item) => (
              <NavLink className={navClass} end={item.path === "/"} key={item.path} to={item.path}>
                {t(item.label)}
              </NavLink>
            ))}
            <LanguageToggle />
            <Button className="mt-2" to={ROUTES.AUTH.LOGIN} icon="LogIn" variant="secondary">
              Login
            </Button>
            <Button to="/enquiry" icon="ArrowRight">
              Request Enquiry
            </Button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
