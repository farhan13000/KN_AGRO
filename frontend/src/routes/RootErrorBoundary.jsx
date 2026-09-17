import { Link, useRouteError } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { getPortalRouteForRole, useAuth } from "../core/auth";
import { ROUTES } from "../shared/constants";

// The specific failure main.jsx's own `vite:preloadError` listener already
// reloads for automatically — this is the fallback for the rare case that
// listener doesn't fire first (or a browser worded the fetch failure
// slightly differently), so the message is still recognized and answered
// with "reload will fix this" rather than a generic, unhelpful one.
const isStaleChunkError = (error) => {
  const message = error?.message || String(error ?? "");
  return /dynamically imported module|importing a module script failed/i.test(message);
};

/**
 * The router's root errorElement — every top-level route in AppRouter.jsx
 * is nested under one pathless layout route so this single boundary
 * catches an unhandled error from ANY of them, replacing React Router's
 * own default fallback (a raw, unstyled stack trace — see the "Unexpected
 * Application Error!" screen this exists to stop showing real users).
 */
export default function RootErrorBoundary() {
  const error = useRouteError();
  const { authenticated, role } = useAuth();
  const staleChunk = isStaleChunkError(error);
  const primaryRoute = authenticated ? getPortalRouteForRole(role) : ROUTES.AUTH.LOGIN;

  // eslint-disable-next-line no-console -- deliberate: the one place this
  // error is otherwise fully swallowed from view.
  console.error("Unhandled route error:", error);

  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory px-5 py-12">
      <section className="w-full max-w-xl rounded-2xl bg-white p-8 text-center shadow-card ring-1 ring-forest/10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-700">
          <AlertTriangle className="h-8 w-8" />
        </span>
        <p className="mt-6 text-sm font-bold uppercase tracking-[0.16em] text-agriculture">
          {staleChunk ? "Update available" : "Unexpected error"}
        </p>
        <h1 className="mt-3 text-3xl font-black text-ink">
          {staleChunk ? "A new version of the app is available." : "Something went wrong."}
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted">
          {staleChunk
            ? "This tab was open before an update was published, so it's still holding an outdated copy of the app. Reloading fetches the current version."
            : "This screen hit an error it couldn't recover from. Reloading usually fixes it."}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-forest px-5 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-agriculture"
            onClick={() => window.location.reload()}
            type="button"
          >
            Reload
          </button>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-forest/20 bg-white px-5 py-3 text-sm font-bold text-forest transition hover:bg-mint"
            to={primaryRoute}
          >
            {authenticated ? "Go to my dashboard" : "Go to login"}
          </Link>
        </div>
      </section>
    </main>
  );
}
