import Button from "../../../../shared/components/Button";
import Icon from "../../../../shared/components/Icon";
import { useLanguage } from "../../../../i18n/LanguageContext";
import heroSectionImage from "../../../../assets/Hero Section Image.png";

const trustCards = [
  {
    title: "Quality Products",
    description: "Carefully selected and tested for best results",
    icon: "Leaf",
  },
  {
    title: "Reliable Supply",
    description: "Timely delivery with consistent availability",
    icon: "ShieldCheck",
  },
  {
    title: "Farmer Focused",
    description: "Solutions designed for better farm productivity",
    icon: "HeartHandshake",
  },
  {
    title: "Trusted Service",
    description: "Building long term relationships",
    icon: "Award",
  },
];

export default function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative z-0 overflow-visible bg-white">
      <div className="relative z-0 min-h-[680px] overflow-hidden">
        <img
          alt="KN Agro fertilizer bags in a green farm field at sunrise"
          className="absolute inset-0 h-full w-full object-cover object-[58%_center]"
          loading="eager"
          src={heroSectionImage}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/78 via-white/52 to-white/0" />
        <div className="absolute inset-y-0 left-0 w-[54%] bg-white/18" />
        <div className="absolute inset-y-0 left-0 w-[38%] bg-white/10 backdrop-blur-[0.5px]" />
        <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-[#356f24]/55 via-leaf/20 to-transparent" />

        <div className="site-container relative z-10 flex min-h-[680px] items-center pb-28 pt-12">
          <div className="max-w-2xl rounded-[1.75rem] bg-white/56 p-5 shadow-[0_20px_70px_rgba(255,255,255,0.28)] backdrop-blur-[2px] sm:p-7 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-0">
            <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-agriculture">
              {t("Trusted Agricultural Solutions")}
            </p>
            <h1 className="mt-5 text-5xl font-black leading-[1.08] text-[#101811] drop-shadow-[0_2px_0_rgba(255,255,255,0.75)] sm:text-6xl lg:text-7xl">
              {t("Better Inputs.")}
              <span className="block">{t("Healthier Crops.")}</span>
              <span className="block text-agriculture drop-shadow-[0_2px_0_rgba(255,255,255,0.8)]">
                {t("Stronger Growth.")}
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base font-semibold leading-8 text-[#253326]">
              {t(
                "KN Agro is committed to providing high quality bio-fertilizers, organic fertilizers and agricultural inputs that improve soil health, boost productivity and ensure sustainable farming.",
              )}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button className="rounded-full px-7" to="/products" icon="ArrowRight">
                Explore Products
              </Button>
              <Button className="rounded-full px-7" to="/enquiry" variant="secondary" icon="Send">
                Send Enquiry
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="site-container relative z-30 -mt-20">
        <div className="relative z-40 grid gap-4 rounded-[2rem] border border-forest/10 bg-white p-5 shadow-[0_24px_60px_rgba(24,34,26,0.15)] backdrop-blur md:grid-cols-2 lg:grid-cols-4 lg:p-6">
          {trustCards.map((item) => (
            <article className="flex items-center gap-4 rounded-2xl p-3" key={item.title}>
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-mint text-agriculture ring-1 ring-forest/10">
                <Icon name={item.icon} className="h-8 w-8" strokeWidth={1.8} />
              </span>
              <span>
                <span className="block text-sm font-extrabold text-ink">{t(item.title)}</span>
                <span className="mt-1 block text-xs leading-5 text-muted">{t(item.description)}</span>
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
