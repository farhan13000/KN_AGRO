import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * "Back", for any page that is not one of the portal's own top-level
 * screens.
 *
 * Two behaviours, because plain `navigate(-1)` is not enough on its own:
 * someone who opened a lead from a WhatsApp link, or who refreshed the
 * page, has no in-app history to go back to — the browser would leave the
 * app entirely, or do nothing at all. So this uses history only when there
 * IS history to use (react-router records its position in
 * `history.state.idx`), and otherwise walks up one level in the path:
 * `/super-admin/leads/123/print` to `/super-admin/leads/123`, and
 * `/super-admin/leads/create` to `/super-admin/leads`.
 *
 * `rootPaths` are the screens reached straight from the sidebar — there is
 * nothing above them, so the button hides itself there rather than
 * offering a way out that leads nowhere useful.
 */
const parentPath = (pathname) => {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length <= 1) return null;
  return `/${segments.slice(0, -1).join("/")}`;
};

export default function BackButton({ className = "", label = "Back", rootPaths = [] }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const here = pathname.replace(/\/+$/, "") || "/";
  if (rootPaths.some((root) => root.replace(/\/+$/, "") === here)) return null;

  const parent = parentPath(here);
  if (!parent) return null;

  const goBack = () => {
    // react-router keeps its own index into the history stack; anything
    // above 0 means we arrived here from another page inside the app.
    const cameFromInsideTheApp = (window.history.state?.idx ?? 0) > 0;
    if (cameFromInsideTheApp) navigate(-1);
    else navigate(parent, { replace: true });
  };

  return (
    <button
      aria-label={label}
      className={`inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-bold text-forest shadow-sm ring-1 ring-forest/10 transition hover:bg-mint print:hidden ${className}`}
      onClick={goBack}
      type="button"
    >
      <ArrowLeft aria-hidden="true" className="h-4 w-4 shrink-0" />
      <span>{label}</span>
    </button>
  );
}
