import { useEffect, useRef, useState } from "react";
import { Camera, Gauge, MapPin, RefreshCw, UserRound } from "lucide-react";
import Modal from "../../../shared/components/Modal";
import { getApiErrorMessage } from "../../../core/api";
import { MEDIA_KIND, useMediaUpload } from "../../media";
import { describeLocationError, requestCurrentLocation } from "../utils/attendanceLocation";
import {
  DEFAULT_ATTENDANCE_POLICY,
  TONE_CLASSES,
  describeCheckIn,
  describeCheckOut,
} from "../utils/attendancePolicy";

/**
 * One camera slot: take a photo, see it, retake it.
 *
 * `capture` opens the camera directly on a phone — "user" for the front
 * camera (selfie), "environment" for the rear one (meter). It is the
 * strongest thing a web page can ask for: on mobile it skips the gallery,
 * but a browser is free to ignore it (desktop browsers show a file
 * picker), so it discourages an old photo rather than making one
 * impossible. The uploaded time and the manager's review are the real
 * checks.
 */
function CameraSlot({ capture, hint, icon: Icon, label, onChange, value }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState("");
  const upload = useMediaUpload(MEDIA_KIND.ATTENDANCE_PHOTO);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    // Let the same slot be retaken with an identical file name.
    event.target.value = "";
    if (!file) return;
    onChange(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    const uploaded = await upload.upload(file);
    if (uploaded?.url) onChange({ url: uploaded.url, publicId: uploaded.publicId });
  };

  return (
    <div className="rounded-xl border border-forest/10 bg-white p-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-forest" />
        <span className="text-sm font-black text-ink">{label}</span>
        {value ? <span className="ml-auto text-xs font-bold text-green-700">Attached</span> : null}
      </div>
      <p className="mt-1 text-xs text-muted">{hint}</p>

      <input
        accept="image/*"
        capture={capture}
        className="sr-only"
        data-slot={label}
        onChange={handleFile}
        ref={inputRef}
        type="file"
      />

      {preview ? (
        <div className="mt-3 space-y-2">
          <img alt={label} className="h-40 w-full rounded-lg object-cover ring-1 ring-forest/15" src={preview} />
          <button
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint"
            onClick={() => inputRef.current?.click()}
            type="button"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retake
          </button>
        </div>
      ) : (
        <button
          className="mt-3 flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-forest/25 bg-mint/30 px-3 py-5 text-sm font-bold text-forest transition hover:bg-mint"
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          <Camera className="h-6 w-6" />
          Open camera
        </button>
      )}

      {upload.isUploading ? (
        <p className="mt-2 text-xs font-semibold text-muted">Uploading… {upload.progress}%</p>
      ) : null}
      {upload.errorMessage ? <p className="mt-2 text-xs font-semibold text-red-700">{upload.errorMessage}</p> : null}
    </div>
  );
}

/**
 * The location row: asks the browser for the position as soon as the
 * dialog opens, and offers Retry when permission is refused or GPS is
 * slow. Check in/out stays disabled until a position arrives.
 */
function LocationStatus({ state, onRetry }) {
  const tone =
    state.status === "ready"
      ? "border-green-200 bg-green-50 text-green-800"
      : state.status === "error"
        ? "border-red-200 bg-red-50 text-red-800"
        : "border-forest/10 bg-mint/30 text-ink";

  return (
    <div className={`flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2 text-sm ${tone}`}>
      <MapPin className="h-4 w-4 shrink-0" />
      <span className="min-w-0 flex-1 font-semibold">
        {state.status === "ready"
          ? `Location captured${state.location.accuracy ? ` (±${Math.round(state.location.accuracy)} m)` : ""}`
          : state.status === "error"
            ? state.message
            : "Getting your location… allow location access if the browser asks."}
      </span>
      {state.status === "error" ? (
        <button
          className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint"
          onClick={onRetry}
          type="button"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      ) : null}
    </div>
  );
}

/**
 * Marking attendance: a selfie, a photo of the vehicle's meter, and the
 * reading on it — all three required, at check-in and at check-out. The
 * backend refuses the request without them; this dialog simply does not
 * let the button be pressed until they are there.
 *
 * The timing banner at the top is the warning the person must see before
 * acting (late check-in / early check-out = half day). It re-evaluates
 * every 30 seconds while open, so a dialog left open across 9:30 updates.
 */
export default function AttendanceMarkDialog({
  isOpen,
  minMeterReading = null,
  mode = "in",
  onClose,
  onConfirm,
  policy = DEFAULT_ATTENDANCE_POLICY,
}) {
  const [selfie, setSelfie] = useState(null);
  const [meterPhoto, setMeterPhoto] = useState(null);
  const [meterReading, setMeterReading] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [locationState, setLocationState] = useState({ status: "idle", location: null, message: "" });

  // Each request is tagged so a slow answer from a closed or retried
  // dialog never overwrites a newer one.
  const locationRequestRef = useRef(0);
  const captureLocation = async () => {
    const requestId = locationRequestRef.current + 1;
    locationRequestRef.current = requestId;
    setLocationState({ status: "loading", location: null, message: "" });
    try {
      const position = await requestCurrentLocation();
      if (locationRequestRef.current === requestId) {
        setLocationState({ status: "ready", location: position, message: "" });
      }
    } catch (locationError) {
      if (locationRequestRef.current === requestId) {
        setLocationState({ status: "error", location: null, message: describeLocationError(locationError) });
      }
    }
  };

  const isCheckOut = mode === "out";
  const title = isCheckOut ? "Check out" : "Check in";

  useEffect(() => {
    if (!isOpen) return undefined;
    setSelfie(null);
    setMeterPhoto(null);
    setMeterReading("");
    setError("");
    setIsSubmitting(false);
    setNow(new Date());
    captureLocation();
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => {
      clearInterval(timer);
      locationRequestRef.current += 1;
    };
    // captureLocation only touches a ref and state setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const timing = isCheckOut ? describeCheckOut(now, policy) : describeCheckIn(now, policy);

  const readingNumber = meterReading === "" ? null : Number(meterReading);
  const readingProblem =
    readingNumber === null
      ? "Enter the meter reading."
      : !Number.isFinite(readingNumber) || readingNumber < 0
        ? "Enter a valid meter reading."
        : isCheckOut && typeof minMeterReading === "number" && readingNumber < minMeterReading
          ? `Must be at least this morning's reading (${minMeterReading} km).`
          : "";

  const location = locationState.status === "ready" ? locationState.location : null;
  const canSubmit = Boolean(selfie && meterPhoto && location && !readingProblem && !isSubmitting);

  const handleSubmit = async () => {
    if (!canSubmit) {
      setError(
        !selfie
          ? "Take your selfie first."
          : !meterPhoto
            ? "Take a photo of the meter."
            : readingProblem || (!location ? "Your location is needed to continue." : ""),
      );
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await onConfirm({ selfie, meterPhoto, meterReading: readingNumber, location });
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p className={`rounded-lg border px-3 py-2 text-sm font-semibold ${TONE_CLASSES[timing.tone]}`} role="status">
          {timing.message}
        </p>

        <LocationStatus onRetry={captureLocation} state={locationState} />

        <div className="grid gap-3 sm:grid-cols-2">
          <CameraSlot
            capture="user"
            hint="Front camera. Your face must be clearly visible."
            icon={UserRound}
            label="Selfie"
            onChange={setSelfie}
            value={selfie}
          />
          <CameraSlot
            capture="environment"
            hint="Rear camera. The reading must be readable."
            icon={Gauge}
            label="Meter reading photo"
            onChange={setMeterPhoto}
            value={meterPhoto}
          />
        </div>

        <label className="block">
          <span className="form-label">Meter reading (km)</span>
          <input
            className="form-field"
            inputMode="decimal"
            min={isCheckOut && typeof minMeterReading === "number" ? minMeterReading : 0}
            name="meterReading"
            onChange={(event) => setMeterReading(event.target.value)}
            placeholder={isCheckOut && typeof minMeterReading === "number" ? `≥ ${minMeterReading}` : "e.g. 45230"}
            required
            step="any"
            type="number"
            value={meterReading}
          />
          {meterReading !== "" && readingProblem ? (
            <span className="mt-1 block text-xs font-semibold text-red-700">{readingProblem}</span>
          ) : null}
        </label>

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
            disabled={!canSubmit}
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
