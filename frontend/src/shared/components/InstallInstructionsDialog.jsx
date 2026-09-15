import { PlusSquare, Share } from "lucide-react";
import Modal from "./Modal";
import { detectIosBrowser } from "../hooks/useInstallPrompt";
import { useLanguage } from "../../i18n/LanguageContext";

const Step = ({ children, number }) => (
  <li className="flex gap-3">
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-forest text-sm font-black text-white">
      {number}
    </span>
    <span className="pt-0.5 text-sm leading-6 text-ink">{children}</span>
  </li>
);

const ShareIcon = () => (
  <Share aria-label="Share" className="mx-1 inline h-4 w-4 -translate-y-0.5 text-[#007AFF]" />
);

/**
 * Apple devices give a web page no way to trigger an install, so the
 * Install button opens these steps instead. `platform` is "ios" (iPhone /
 * iPad) or "mac-safari".
 */
export default function InstallInstructionsDialog({ isOpen, onClose, platform }) {
  const { t } = useLanguage();
  const browser = platform === "ios" ? detectIosBrowser() : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("Install KN Agro")}>
      <div className="space-y-4" data-install-instructions={platform}>
        {platform === "mac-safari" ? (
          <ol className="space-y-3">
            <Step number={1}>{t("In the Safari menu bar, open File.")}</Step>
            <Step number={2}>{t("Choose “Add to Dock…”, then click Add.")}</Step>
            <Step number={3}>{t("Open KN Agro from your Dock like any other app.")}</Step>
          </ol>
        ) : browser === "in-app" ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">
            {t("This page is open inside another app. Tap ••• and choose “Open in Safari”, then tap Install again.")}
          </p>
        ) : (
          <ol className="space-y-3">
            <Step number={1}>
              {browser === "safari" ? (
                <>
                  {t("Tap the Share button")} <ShareIcon /> {t("at the bottom of Safari (on iPad: top right).")}
                </>
              ) : (
                <>
                  {t("Tap the Share button")} <ShareIcon /> {t("in the address bar (top right).")}
                </>
              )}
            </Step>
            <Step number={2}>
              {t("Scroll down and tap")}{" "}
              <b className="whitespace-nowrap">
                <PlusSquare className="mr-1 inline h-4 w-4 -translate-y-0.5" />
                {t("Add to Home Screen")}
              </b>
              .
            </Step>
            <Step number={3}>{t("Tap Add. KN Agro now opens from your Home Screen like an app.")}</Step>
          </ol>
        )}

        {platform === "ios" && browser !== "in-app" && browser !== "safari" ? (
          <p className="text-xs text-muted">
            {t("Don’t see “Add to Home Screen”? Open this page in Safari and try again.")}
          </p>
        ) : null}

        <div className="flex justify-end">
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-forest px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture"
            onClick={onClose}
            type="button"
          >
            {t("Got it")}
          </button>
        </div>
      </div>
    </Modal>
  );
}
