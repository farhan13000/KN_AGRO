import { useCallback, useState } from "react";
import { useAsyncMutation } from "../../../shared/hooks/useAsyncResource";
import { mediaApi } from "../services";
import { MEDIA_KIND_RULES, formatBytes } from "../constants";

/**
 * Upload state for one field.
 *
 * Client-side type/size checks here are a courtesy, not a control — the
 * backend re-checks both and is the only thing that decides. Doing them
 * anyway means a 20MB file is refused instantly instead of after a long
 * upload that was always going to 400.
 */
export const useMediaUpload = (kind, { onUploaded } = {}) => {
  const [progress, setProgress] = useState(0);
  const [localError, setLocalError] = useState("");
  const rule = MEDIA_KIND_RULES[kind];

  const mutation = useAsyncMutation(
    (file) => mediaApi.upload(kind, file, { onProgress: setProgress }),
    { onSuccess: onUploaded },
  );

  const { mutate } = mutation;

  const upload = useCallback(
    async (file) => {
      setLocalError("");
      if (!file) return null;

      if (rule && !rule.mimeTypes.includes(file.type)) {
        setLocalError(`Unsupported file type. Accepted: ${rule.label}.`);
        return null;
      }
      if (rule && file.size > rule.maxBytes) {
        setLocalError(
          `That file is ${formatBytes(file.size)}. The maximum is ${formatBytes(rule.maxBytes)}.`,
        );
        return null;
      }

      setProgress(0);
      try {
        return await mutate(file);
      } catch {
        // useAsyncMutation already captured it into mutation.error; it is
        // rethrown for callers who await, and swallowed here so a failed
        // upload never becomes an unhandled rejection in the field.
        return null;
      }
    },
    [mutate, rule],
  );

  return {
    upload,
    progress,
    isUploading: mutation.isLoading,
    // A local validation failure and a server failure are the same thing
    // to the field rendering this — one message either way.
    errorMessage: localError || mutation.errorMessage,
    isError: Boolean(localError) || mutation.isError,
    reset: () => {
      setLocalError("");
      setProgress(0);
    },
  };
};
