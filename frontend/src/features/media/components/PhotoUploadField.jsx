import { useRef } from "react";
import { Camera, Loader2, Trash2, User } from "lucide-react";
import { useMediaUpload } from "../hooks";
import { MEDIA_KIND, MEDIA_KIND_RULES } from "../constants";

/**
 * Profile-photo picker.
 *
 * `value` is the stored asset ({ url, publicId }) or null, and `onChange`
 * is handed exactly that shape — the same object the API returns and the
 * same one the employee/hiring payloads carry. The parent form never
 * touches the File itself: the upload happens here, immediately on pick,
 * so by the time the form is submitted the photo is already stored and
 * the payload holds only a reference.
 *
 * Clearing sets null rather than omitting the field, which is what tells
 * the backend "remove the existing photo" instead of "leave it alone".
 */
export default function PhotoUploadField({
  value,
  onChange,
  label = "Profile Photo",
  disabled = false,
  error = "",
}) {
  const inputRef = useRef(null);
  const rule = MEDIA_KIND_RULES[MEDIA_KIND.EMPLOYEE_PHOTO];
  const uploader = useMediaUpload(MEDIA_KIND.EMPLOYEE_PHOTO, {
    onUploaded: (asset) => {
      if (asset) onChange(asset);
    },
  });

  const handlePick = async (event) => {
    const file = event.target.files?.[0];
    // Reset the input straight away so picking the SAME file again after
    // a failure still fires a change event.
    event.target.value = "";
    if (file) await uploader.upload(file);
  };

  const handleClear = () => {
    uploader.reset();
    onChange(null);
  };

  const message = error || uploader.errorMessage;

  return (
    <div>
      <span className="form-label">{label}</span>
      <div className="mt-2 flex flex-wrap items-center gap-4">
        <span className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-forest/15 bg-mint">
          {value?.url ? (
            <img alt="" className="h-full w-full object-cover" src={value.url} />
          ) : (
            <User aria-hidden className="h-9 w-9 text-forest/40" />
          )}
          {uploader.isUploading ? (
            <span className="absolute inset-0 flex items-center justify-center bg-white/70">
              <Loader2 className="h-6 w-6 animate-spin text-forest" />
            </span>
          ) : null}
        </span>

        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <button
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint disabled:opacity-60"
              disabled={disabled || uploader.isUploading}
              onClick={() => inputRef.current?.click()}
              type="button"
            >
              <Camera className="h-4 w-4" />
              {value?.url ? "Change Photo" : "Upload Photo"}
            </button>
            {value?.url ? (
              <button
                className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                disabled={disabled || uploader.isUploading}
                onClick={handleClear}
                type="button"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            ) : null}
          </div>
          <p className="text-xs font-semibold text-muted">
            {uploader.isUploading ? `Uploading... ${uploader.progress}%` : rule.label}
          </p>
        </div>
      </div>

      <input
        accept={rule.accept}
        className="hidden"
        onChange={handlePick}
        ref={inputRef}
        type="file"
      />

      {message ? <p className="mt-2 text-sm font-semibold text-red-700">{message}</p> : null}
    </div>
  );
}
