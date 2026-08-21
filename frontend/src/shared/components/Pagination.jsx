import { useLanguage } from "../../i18n/LanguageContext";
import Button from "./Button";

export default function Pagination({ page, totalPages, onPageChange }) {
  const { t } = useLanguage();
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Product pagination" className="mt-10 flex flex-wrap items-center justify-center gap-3">
      <Button disabled={page === 1} onClick={() => onPageChange(page - 1)} variant="secondary">
        {t("Previous")}
      </Button>
      {Array.from({ length: totalPages }).map((_, index) => {
        const pageNumber = index + 1;
        return (
          <button
            aria-current={pageNumber === page ? "page" : undefined}
            className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm font-extrabold transition ${
              pageNumber === page ? "bg-forest text-white" : "bg-white text-forest hover:bg-mint"
            }`}
            key={pageNumber}
            onClick={() => onPageChange(pageNumber)}
            type="button"
          >
            {pageNumber}
          </button>
        );
      })}
      <Button disabled={page === totalPages} onClick={() => onPageChange(page + 1)} variant="secondary">
        {t("Next")}
      </Button>
    </nav>
  );
}
