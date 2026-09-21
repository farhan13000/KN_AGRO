import { ROLE_LABELS } from "../constants";
import { useAuth } from "../../core/auth";

export default function DashboardShell({ title, description }) {
  const { role, user } = useAuth();
  const roleLabel = ROLE_LABELS[role] || role || "Portal User";

  return (
    <div className="space-y-6">
      {/* The eyebrow above the title used to read "Phase 1", and a third
          card beside the account summary announced that modules would be
          "connected in later phases after their backend contracts are
          ready". Both were notes to ourselves about how far the build had
          got, sitting on the first screen every employee opens. The
          eyebrow now names the portal they are in, and the card is gone. */}
      <section className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-forest/10">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-agriculture">{roleLabel}</p>
        <h1 className="mt-2 text-3xl font-black text-ink">{title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{description}</p>
      </section>

      <section>
        <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-forest/10">
          <h2 className="text-lg font-black text-ink">Account Summary</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-bold uppercase tracking-[0.12em] text-soft">Name</dt>
              <dd className="mt-1 break-words text-sm font-semibold text-ink">{user?.name || "Not available"}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-[0.12em] text-soft">Email</dt>
              <dd className="mt-1 break-words text-sm font-semibold text-ink">{user?.email || "Not available"}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-[0.12em] text-soft">Role</dt>
              <dd className="mt-1 text-sm font-semibold text-ink">{roleLabel}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-[0.12em] text-soft">Status</dt>
              <dd className="mt-1 text-sm font-semibold text-ink">{user?.status || "Not available"}</dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}

