export default function RouteLoader({ message = "Loading workspace..." }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-6 text-center">
      <div>
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-mint border-t-agriculture" />
        <p className="mt-4 text-sm font-semibold text-forest">{message}</p>
      </div>
    </div>
  );
}

