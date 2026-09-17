import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { getApiErrorMessage } from "../../../core/api";
import { useAuth } from "../../../core/auth";
import Avatar from "../../../shared/components/Avatar";
import Button from "../../../shared/components/Button";
import { PhotoUploadField } from "../../media";
import { useEmployeeActions } from "../hooks";
import { getEmployeeDisplayName } from "../utils";

/**
 * Your own photo, changeable by you.
 *
 * Every role gets this: the photo belongs to the person, it grants
 * nothing, and PATCH /employees/me has always allowed it — this is just
 * the place to do it from, instead of asking an admin. Saving also
 * re-reads the session, so the header avatar changes in the same breath
 * rather than after a reload.
 */
export default function ProfilePhotoCard({ employee, onSaved }) {
  const { refreshUser } = useAuth();
  const actions = useEmployeeActions();
  const employeePhotoUrl = employee?.photo?.url || "";
  const [photo, setPhoto] = useState(employee?.photo || null);
  const [error, setError] = useState("");
  // What is actually saved, tracked locally rather than re-derived from
  // the `employee` prop — that prop only catches up once the parent's
  // own query refetches, which is a separate, unawaited request. Without
  // this, "saved" and "dirty" would flicker false right after a
  // successful save, before that refetch lands.
  const [savedUrl, setSavedUrl] = useState(employeePhotoUrl);
  const [justSaved, setJustSaved] = useState(false);

  // Someone else (an admin) may have changed it while this page was open.
  useEffect(() => {
    setPhoto(employee?.photo || null);
    setSavedUrl(employeePhotoUrl);
  }, [employeePhotoUrl]);

  const pickedUrl = photo?.url || "";
  const isDirty = pickedUrl !== savedUrl;
  const name = getEmployeeDisplayName(employee);

  const handleSave = async () => {
    setError("");
    setJustSaved(false);
    try {
      await actions.updateMyProfile.mutate({
        // null is meaningful: it removes the photo rather than leaving
        // the stored one alone.
        photo: photo?.url ? { url: photo.url, publicId: photo.publicId } : null,
      });
      setSavedUrl(pickedUrl);
      setJustSaved(true);
      await refreshUser();
      onSaved?.();
    } catch (mutationError) {
      setError(getApiErrorMessage(mutationError));
    }
  };

  return (
    <section
      className="rounded-lg border border-forest/10 bg-white p-5 shadow-sm"
      data-profile-photo-card
    >
      <h2 className="text-lg font-black text-ink">Profile Photo</h2>
      <p className="mt-1 text-sm text-muted">
        Yeh photo aapke naam ke saath har jagah dikhti hai — team list, dropdown suggestions aur header me.
      </p>

      <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-start">
        <Avatar className="ring-2" name={name} size="xl" src={pickedUrl} />
        <div className="min-w-0 flex-1">
          <PhotoUploadField label="Change photo" onChange={setPhoto} value={photo} />

          {error ? (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">
              {error}
            </p>
          ) : null}
          {justSaved && !isDirty ? (
            <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-forest">
              <Check className="h-4 w-4" />
              Photo updated
            </p>
          ) : null}

          <div className="mt-4">
            <Button
              disabled={!isDirty || actions.updateMyProfile.isLoading}
              onClick={handleSave}
              type="button"
            >
              {actions.updateMyProfile.isLoading ? "Saving..." : "Save Photo"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
