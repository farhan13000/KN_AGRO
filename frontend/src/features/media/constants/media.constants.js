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
  PRODUCT_IMAGE: "PRODUCT_IMAGE",
});

export const MEDIA_KIND_RULES = Object.freeze({
  [MEDIA_KIND.EMPLOYEE_PHOTO]: Object.freeze({
    accept: "image/jpeg,image/png,image/webp",
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
    maxBytes: 5 * 1024 * 1024,
    // Shown small (avatars, detail headers) and face-cropped to 512px on
    // the server anyway, so 1024px is more than enough to send.
    compress: Object.freeze({ maxDimension: 1024, quality: 0.82 }),
    label: "JPG, PNG or WebP. Large photos are resized automatically.",
  }),
  [MEDIA_KIND.ATTENDANCE_PHOTO]: Object.freeze({
    accept: "image/jpeg,image/png,image/webp",
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
    // Higher than a profile photo on purpose: this is taken on a phone,
    // in the field, and is refused outright if it is too large.
    maxBytes: 8 * 1024 * 1024,
    // Evidence of a place, so a little more detail than an avatar — but
    // the server limits it to 1280px, so sending more is wasted upload.
    compress: Object.freeze({ maxDimension: 1600, quality: 0.8 }),
    label: "JPG, PNG or WebP. Large photos are resized automatically.",
  }),
  [MEDIA_KIND.PRODUCT_IMAGE]: Object.freeze({
    accept: "image/jpeg,image/png,image/webp",
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
    maxBytes: 8 * 1024 * 1024,
    // A pack shot for the catalogue; the server limits it to 1600px, so
    // that is all that is worth sending.
    compress: Object.freeze({ maxDimension: 1600, quality: 0.85 }),
    label: "JPG, PNG or WebP. Large photos are resized automatically.",
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
