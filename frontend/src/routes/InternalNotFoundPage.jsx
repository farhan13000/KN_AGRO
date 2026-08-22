import { Link } from "react-router-dom";
import { FileQuestion } from "lucide-react";
import { getPortalRouteForRole, useAuth } from "../core/auth";

export default function InternalNotFoundPage() {
  const { role } = useAuth();

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center px-4 py-12 text-center">
      <div className="rounded-2xl bg-white p-8 shadow-card ring-1 ring-forest/10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-mint text-forest">
          <FileQuestion className="h-8 w-8" />
        </span>
        <p className="mt-6 text-sm font-bold uppercase tracking-[0.16em] text-agriculture">404</p>
        <h1 className="mt-3 text-3xl font-black text-ink">This workspace page does not exist.</h1>
        <p className="mt-4 text-sm leading-6 text-muted">
          The route may be unavailable in Phase 1 or reserved for a later business module.
        </p>
        <Link
          className="mt-8 inline-flex min-h-11 items-center justify-center rounded-xl bg-forest px-5 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-agriculture"
          to={getPortalRouteForRole(role)}
        >
          Back to dashboard
        </Link>
      </div>
    </section>
  );
}

