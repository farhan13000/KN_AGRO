import LoadingSpinner from "./LoadingSpinner";

export default function PageLoader({ message = "Loading..." }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-6 text-center">
      <div>
        <LoadingSpinner className="h-12 w-12" label={message} />
        <p className="mt-4 text-sm font-semibold text-forest">{message}</p>
      </div>
    </div>
  );
}

