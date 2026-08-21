import Icon from "./Icon";

const accentClasses = {
  green: "from-white via-[#f4fbef] to-[#dcefd5] border-agriculture/25",
  gold: "from-white via-[#fff9e8] to-[#efe3c2] border-mustard/35",
  lime: "from-white via-[#f4ffe8] to-[#d7efbf] border-leaf/35",
  dark: "from-white via-[#edf6ed] to-[#bbd8bd] border-forest/25",
};

export default function ProductPackVisual({ product, size = "card", className = "" }) {
  const visual = product.visual || {};
  const isBottle = visual.type === "bottle";
  const scale =
    size === "hero"
      ? isBottle
        ? "h-72 w-28 sm:h-80 sm:w-32"
        : "h-[330px] w-[215px] sm:h-[365px] sm:w-[240px]"
      : isBottle
        ? "h-44 w-16"
        : "h-48 w-32";
  const accent = accentClasses[visual.accent || "green"];
  const productTitle = product.name.toUpperCase();
  const isHero = size === "hero";
  const brandClass = isHero
    ? "text-[11px] font-black uppercase tracking-[0.16em]"
    : "text-[7px] font-black uppercase tracking-[0.12em]";
  const titleClass = isHero
    ? "mt-5 text-2xl font-black uppercase leading-none tracking-tight sm:text-[1.7rem]"
    : "mt-2 text-sm font-black uppercase leading-none tracking-tight";
  const subtitleClass = isHero
    ? "mt-2 text-[11px] font-black leading-snug"
    : "mt-1 text-[7px] font-black leading-snug";
  const iconWrapClass = isHero
    ? "bottom-24 h-24 w-24"
    : "bottom-14 h-14 w-14";
  const iconClass = isHero ? "h-14 w-14" : "h-8 w-8";
  const bottomBandClass = isHero ? "h-28" : "h-16";
  const textTopClass = isHero ? "top-10" : "top-7";

  if (isBottle) {
    return (
      <div className={`flex flex-col items-center justify-end ${className}`} aria-label={`${product.name} bottle mockup`}>
        <div className="h-9 w-16 rounded-t-xl border border-forest/15 bg-white shadow-sm" />
        <div className={`${scale} relative overflow-hidden rounded-[2.25rem] border bg-gradient-to-b ${accent} shadow-soft`}>
          <div className="absolute inset-x-3 top-8 rounded-xl bg-white/88 px-2 py-4 text-center shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-forest">KN Agro</p>
            <p className="mt-3 text-lg font-black leading-tight text-forest">{productTitle}</p>
            <p className="mt-2 text-[10px] font-bold leading-tight text-muted">{visual.subtitle || product.unit}</p>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-r from-forest to-agriculture" />
          <div className="absolute bottom-12 left-1/2 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full bg-white text-agriculture shadow-card">
            <Icon name={visual.icon || "Sprout"} className="h-9 w-9" strokeWidth={1.8} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} aria-label={`${product.name} pack mockup`}>
      <div className={`${scale} bora-pack relative overflow-hidden border bg-gradient-to-b ${accent} shadow-soft`}>
        <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white via-white/95 to-white/55" />
        <div className="absolute left-4 top-0 h-full w-5 bg-gradient-to-r from-black/12 to-transparent opacity-35" />
        <div className="absolute right-4 top-0 h-full w-5 bg-gradient-to-l from-black/12 to-transparent opacity-35" />
        <div className="absolute inset-x-5 top-5 border-t border-forest/10" />

        <div className={`absolute inset-x-4 ${textTopClass} text-center`}>
          <p className={`${brandClass} text-forest`}>KN Agro</p>
          <p className={`${titleClass} text-forest`}>{productTitle}</p>
          <p className={`${subtitleClass} text-forest/75`}>{visual.subtitle || product.unit}</p>
        </div>

        <div className={`absolute ${iconWrapClass} left-1/2 flex -translate-x-1/2 items-center justify-center rounded-full bg-white/78 text-agriculture shadow-card ring-1 ring-forest/10`}>
          <Icon name={visual.icon || "Leaf"} className={iconClass} strokeWidth={1.65} />
        </div>

        <div className={`absolute inset-x-0 bottom-0 ${bottomBandClass} overflow-hidden bg-gradient-to-t from-forest via-agriculture to-leaf`}>
          <div className="absolute -left-8 top-4 h-28 w-[120%] rounded-[50%] border-[18px] border-white/16" />
          <div className="absolute left-1/2 top-2 h-24 w-28 -translate-x-1/2 rounded-[50%] bg-[#5b351f]/65 blur-sm" />
          <Icon
            name={visual.icon || "Sprout"}
            className={`${isHero ? "bottom-7 h-12 w-12" : "bottom-3 h-7 w-7"} absolute left-1/2 -translate-x-1/2 text-white`}
            strokeWidth={1.6}
          />
        </div>
      </div>
    </div>
  );
}
