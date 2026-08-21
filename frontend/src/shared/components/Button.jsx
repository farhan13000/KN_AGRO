import { Link } from "react-router-dom";
import { useLanguage } from "../../i18n/LanguageContext";
import Icon from "./Icon";

const variants = {
  primary: "bg-forest text-white hover:bg-agriculture shadow-soft",
  secondary: "bg-white text-forest ring-1 ring-forest/15 hover:bg-mint",
  mustard: "bg-mustard text-ink hover:bg-[#f1b842]",
  ghost: "bg-transparent text-forest hover:bg-mint",
};

export default function Button({
  children,
  to,
  href,
  type = "button",
  variant = "primary",
  icon,
  className = "",
  disabled = false,
  ...props
}) {
  const { t } = useLanguage();
  const classes = `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition duration-200 ${variants[variant]} ${disabled ? "pointer-events-none opacity-60" : ""} ${className}`;
  const content = (
    <>
      {typeof children === "string" ? t(children) : children}
      {icon ? <Icon name={icon} className="h-4 w-4" /> : null}
    </>
  );

  if (to) {
    return (
      <Link className={classes} to={to} {...props}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a className={classes} href={href} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button className={classes} type={type} disabled={disabled} {...props}>
      {content}
    </button>
  );
}
