/**
 * Mirrors the backend's MEDIA_KIND_RULES (src/modules/media/
 * media.constants.js). The server is the authority — it re-checks every
 * one of these — but having them here lets the file picker filter to the
 * right types and lets an oversized file be refused before it is
 * uploaded rather than after.
 */
export const MEDIA_KIND = Object.freeze({
  EMPLOYEE_PHOTO: "EMPLOYEE_PHOTO",
  RESUME: "RESUME",
  ATTENDANCE_PHOTO: "ATTENDANCE_PHOTO",
});

export const MEDIA_KIND_RULES = Object.freeze({
  [MEDIA_KIND.EMPLOYEE_PHOTO]: Object.freeze({
    accept: "image/jpeg,image/png,image/webp",
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
    maxBytes: 5 * 1024 * 1024,
    label: "JPG, PNG or WebP, up to 5MB",
  }),
  [MEDIA_KIND.ATTENDANCE_PHOTO]: Object.freeze({
    accept: "image/jpeg,image/png,image/webp",
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
    // Higher than a profile photo on purpose: this is taken on a phone,
    // in the field, and is refused outright if it is too large.
    maxBytes: 8 * 1024 * 1024,
    label: "JPG, PNG or WebP, up to 8MB",
  }),
  [MEDIA_KIND.RESUME]: Object.freeze({
    accept: "application/pdf",
    mimeTypes: ["application/pdf"],
    maxBytes: 10 * 1024 * 1024,
    label: "PDF, up to 10MB",
  }),
});

export const formatBytes = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
