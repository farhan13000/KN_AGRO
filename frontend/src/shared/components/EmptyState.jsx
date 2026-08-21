import { useLanguage } from "../../i18n/LanguageContext";
import Button from "./Button";
import Icon from "./Icon";

export default function EmptyState({
  title = "Nothing to show yet",
  description = "Please try another option.",
  actionLabel,
  actionTo,
}) {
  const { t } = useLanguage();

  return (
    <div className="rounded-2xl border border-dashed border-forest/20 bg-white p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-mint text-forest">
        <Icon name="Search" />
      </div>
      <h3 className="mt-5 text-xl font-extrabold text-ink">{t(title)}</h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">{t(description)}</p>
      {actionLabel && actionTo ? (
        <Button className="mt-6" to={actionTo}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
