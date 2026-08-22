import { AlertTriangle } from "lucide-react";

export default function ErrorState({
  action,
  message = "Unable to load this information right now.",
  title = "Something went wrong",
}) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-900">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-red-700">
        <AlertTriangle className="h-6 w-6" />
      </span>
      <h2 className="mt-4 text-lg font-black">{title}</h2>
      <p className="mt-2 text-sm font-medium leading-6 text-red-800">{message}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

