import { useEffect, useRef, useState } from "react";
import { Camera, RefreshCw } from "lucide-react";
import Modal from "../../../shared/components/Modal";
import { getApiErrorMessage } from "../../../core/api";
import { MEDIA_KIND, useMediaUpload } from "../../media";

/**
 * Marking attendance with a photo of where you are.
 *
 * The photo is mandatory — the backend refuses a check-in without one —
 * so this dialog gates its own submit button on having uploaded it,
 * rather than letting someone press Check In and get a 400 back.
 *
 * `capture="environment"` asks a phone to open the rear camera directly
 * instead of the gallery. It is a hint, not a guarantee: desktop browsers
 * ignore it and show a file picker, which is why this is a plain file
 * input and not a getUserMedia viewfinder. A viewfinder would need camera
 * permission, a canvas capture step and a fallback for every browser that
 * denies it — the input already gets the camera on the devices that have
 * one.
 */
export default function AttendanceMarkDialog({ isOpen, mode = "in", onClose, onConfirm }) {
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);
  const upload = useMediaUpload(MEDIA_KIND.ATTENDANCE_PHOTO);

  const isCheckOut = mode === "out";
  const title = isCheckOut ? "Check out" : "Check in";

  useEffect(() => {
    if (!isOpen) return;
    setPhoto(null);
    setError("");
    setIsSubmitting(false);
    // The object URL from a previous open is revoked below; clearing the
    // string here keeps a stale image from flashing on reopen.
    setPreview("");
  }, [isOpen]);

  // Object URLs are leaked memory until revoked, and the file never
  // leaves this dialog, so it is revoked as soon as it is replaced.
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    setPhoto(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));

    const uploaded = await upload.upload(file);
    if (uploaded?.url) setPhoto({ url: uploaded.url, publicId: uploaded.publicId });
  };

  const handleSubmit = async () => {
    if (!photo) {
      setError("Take a photo of where you are before marking attendance.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await onConfirm(photo);
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p className="text-sm leading-6 text-muted">
          A photo of where you are is required to {isCheckOut ? "check out" : "check in"}. On a phone this
          opens the camera.
        </p>

        <input
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          className="sr-only"
          onChange={handleFile}
          ref={inputRef}
          type="file"
        />

        {preview ? (
          <div className="space-y-3">
            <img
              alt="Where you are checking in from"
              className="max-h-64 w-full rounded-lg object-cover ring-1 ring-forest/15"
              src={preview}
            />
            <button
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint"
              onClick={() => inputRef.current?.click()}
              type="button"
            >
              <RefreshCw className="h-4 w-4" />
              Retake
            </button>
          </div>
        ) : (
          <button
            className="flex min-h-32 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-forest/25 bg-mint/30 px-4 py-6 text-sm font-bold text-forest transition hover:bg-mint"
            onClick={() => inputRef.current?.click()}
            type="button"
          >
            <Camera className="h-6 w-6" />
            Take a photo
          </button>
        )}

        {upload.isUploading ? (
          <p className="text-sm font-semibold text-muted">Uploading photo… {upload.progress}%</p>
        ) : null}
        {upload.errorMessage ? (
          <p className="text-sm font-semibold text-red-700">{upload.errorMessage}</p>
        ) : null}
        {photo ? <p className="text-sm font-semibold text-green-800">Photo attached.</p> : null}
        {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}

        <div className="flex justify-end gap-3">
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-forest px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!photo || isSubmitting || upload.isUploading}
            onClick={handleSubmit}
            type="button"
          >
            {isSubmitting ? "Saving…" : title}
          </button>
        </div>
      </div>
    </Modal>
  );
}
