import { LocationsMap } from "../../../features/geo";

export default function SuperAdminLocationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">Org Structure</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Locations</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Poori company kahan-kahan kaam kar rahi hai. State par click karke us state ke employees dekho, phir district
          ya employee tak andar jao.
        </p>
      </div>
      <LocationsMap />
    </div>
  );
}
