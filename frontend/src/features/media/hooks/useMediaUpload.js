import { useCallback, useState } from "react";
import { useAsyncMutation } from "../../../shared/hooks/useAsyncResource";
import { mediaApi } from "../services";
import { MEDIA_KIND_RULES, formatBytes } from "../constants";
import { compressImage } from "../utils/compressImage";

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

      // Photos are shrunk in the browser BEFORE the size check, so a 12MB
      // phone photo is judged by the ~1MB file actually sent, not refused
      // for a size it will never be uploaded at. Documents (a PDF resume)
      // are passed through untouched.
      const toSend = rule?.compress ? await compressImage(file, rule.compress) : file;

      if (rule && toSend.size > rule.maxBytes) {
        setLocalError(
          `That file is ${formatBytes(toSend.size)}. The maximum is ${formatBytes(rule.maxBytes)}.`,
        );
        return null;
      }

      setProgress(0);
      try {
        return await mutate(toSend);
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
