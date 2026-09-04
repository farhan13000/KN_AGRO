import { useNavigate } from "react-router-dom";
import Card from "../../../shared/components/Card";
import { ROUTES } from "../../../shared/constants";
import { HiringRequestForm } from "../../../features/hiring";

export default function SuperAdminHiringCreatePage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">Org Structure</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Request a Hire</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Raise a hiring request. The account itself is only created at the final Complete step, once
          the request has been processed, reviewed, and approved.
        </p>
      </div>
      <Card className="p-5">
        <HiringRequestForm
          cancelTo={ROUTES.SUPER_ADMIN.HIRING}
          onCreated={() => navigate(ROUTES.SUPER_ADMIN.HIRING)}
        />
      </Card>
    </div>
  );
}
