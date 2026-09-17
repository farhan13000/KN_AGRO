import { LocationsMap } from "../../../features/geo";

export default function SalesManagerLocationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">My Team</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Locations</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Aapki team kahan-kahan kaam kar rahi hai. State par click karke wahan ke log dekho, phir district ya employee
          tak andar jao.
        </p>
      </div>
      <LocationsMap />
    </div>
  );
}
