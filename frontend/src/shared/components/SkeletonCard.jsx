export default function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-forest/10 bg-white shadow-card">
      <div className="aspect-[4/3] bg-mint" />
      <div className="space-y-4 p-5">
        <div className="h-4 w-24 rounded bg-mint" />
        <div className="h-5 w-4/5 rounded bg-mint" />
        <div className="h-4 w-full rounded bg-mint" />
        <div className="h-4 w-2/3 rounded bg-mint" />
      </div>
    </div>
  );
}
