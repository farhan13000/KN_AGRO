import { useEffect, useState } from "react";

export function usePublicData(fetcher, dependencies = []) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setStatus("loading");
    setError("");

    fetcher()
      .then((result) => {
        if (!mounted) return;
        setData(result);
        setStatus("success");
      })
      .catch((requestError) => {
        if (!mounted) return;
        setError(requestError.friendlyMessage || "Unable to load data.");
        setStatus("error");
      });

    return () => {
      mounted = false;
    };
  }, dependencies);

  return {
    data,
    error,
    isError: status === "error",
    isLoading: status === "loading",
    isSuccess: status === "success",
  };
}
