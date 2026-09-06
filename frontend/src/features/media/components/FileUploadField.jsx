import { useRef } from "react";
import { FileText, Loader2, Trash2, Upload } from "lucide-react";
import { useMediaUpload } from "../hooks";
import { MEDIA_KIND_RULES, formatBytes } from "../constants";

/**
 * Document picker — the resume field's implementation, kept generic
 * because "a stored file reference with a name and a link" is not
 * specific to resumes.
 *
 * Same contract as PhotoUploadField: the file is uploaded on pick and
 * `onChange` receives the stored asset ({ url, publicId, ... }) or null.
 * The parent form submits a reference, never bytes.
 */
export default function FileUploadField({
  kind,
  value,
  onChange,
  label,
  hint = "",
  disabled = false,
  error = "",
}) {
  const inputRef = useRef(null);
  const rule = MEDIA_KIND_RULES[kind];
  const uploader = useMediaUpload(kind, {
    onUploaded: (asset) => {
      if (asset) onChange(asset);
    },
  });

  const handlePick = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) await uploader.upload(file);
  };

  const handleClear = () => {
    uploader.reset();
    onChange(null);
  };

  const message = error || uploader.errorMessage;
  // A record created before uploads existed has a URL but no name/size,
  // so fall back to something meaningful rather than rendering blanks.
  const fileName = value?.originalName || (value?.url ? "Attached file" : "");

  return (
    <div>
      <span className="form-label">{label}</span>

      {value?.url ? (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-forest/15 bg-mint/40 px-4 py-3">
          <a
            className="inline-flex items-center gap-2 text-sm font-bold text-forest underline-offset-2 hover:underline"
            href={value.url}
            rel="noreferrer"
            target="_blank"
          >
            <FileText className="h-4 w-4 shrink-0" />
            <span className="break-all">{fileName}</span>
          </a>
          <span className="flex items-center gap-2">
            {value.bytes ? (
              <span className="text-xs font-semibold text-muted">{formatBytes(value.bytes)}</span>
            ) : null}
            <button
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
              disabled={disabled || uploader.isUploading}
              onClick={handleClear}
              type="button"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </button>
          </span>
        </div>
      ) : (
        <button
          className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-forest/25 bg-white px-4 py-3 text-sm font-bold text-forest transition hover:bg-mint disabled:opacity-60"
          disabled={disabled || uploader.isUploading}
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          {uploader.isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading... {uploader.progress}%
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Choose a file
            </>
          )}
        </button>
      )}

      <p className="mt-2 text-xs font-semibold text-muted">{hint || rule?.label}</p>

      <input accept={rule?.accept} className="hidden" onChange={handlePick} ref={inputRef} type="file" />

      {message ? <p className="mt-2 text-sm font-semibold text-red-700">{message}</p> : null}
    </div>
  );
}
