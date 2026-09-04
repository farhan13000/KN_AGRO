import { useNavigate } from "react-router-dom";
import Card from "../../../shared/components/Card";
import { ROUTES } from "../../../shared/constants";
import { HiringRequestForm } from "../../../features/hiring";

export default function SalesManagerHiringCreatePage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">My Team</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Request a Hire</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Identify a hiring need for your team. No account is created until the request completes the
          full approval chain.
        </p>
      </div>
      <Card className="p-5">
        <HiringRequestForm
          cancelTo={ROUTES.SALES_MANAGER.HIRING}
          onCreated={() => navigate(ROUTES.SALES_MANAGER.HIRING)}
        />
      </Card>
    </div>
  );
}
