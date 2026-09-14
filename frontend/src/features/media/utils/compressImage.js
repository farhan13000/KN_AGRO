/**
 * Shrinks a photo in the browser before it is uploaded.
 *
 * A phone photo is 3–12MB. That size was the whole problem: it hit the
 * per-kind cap, it timed out on a slow connection, and a deployed
 * backend on Vercel never even receives a request body over ~4.5MB. A
 * photo resized to what the app actually displays is ~200KB–1MB and
 * looks the same on screen.
 *
 * Resized, not cropped: the long edge is capped at `maxDimension` and the
 * aspect ratio kept. Re-encoded as JPEG, which is what every one of these
 * photos is anyway; a PNG screenshot turns into a much smaller JPEG too.
 *
 * Never makes things worse: if the result is not smaller than the
 * original (a tiny image already), or the browser cannot decode the file,
 * the original is returned untouched and the server-side checks decide.
 */
const DEFAULT_MAX_DIMENSION = 1600;
const DEFAULT_QUALITY = 0.8;

const loadBitmap = async (file) => {
  if (typeof createImageBitmap === "function") {
    try {
      // Honours EXIF orientation, so a portrait phone photo is not
      // re-encoded lying on its side.
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      // Fall through to the <img> path for browsers that reject the options.
    }
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (error) => {
      URL.revokeObjectURL(url);
      reject(error);
    };
    img.src = url;
  });
};

export const compressImage = async (
  file,
  { maxDimension = DEFAULT_MAX_DIMENSION, quality = DEFAULT_QUALITY } = {},
) => {
  if (!file || !file.type?.startsWith("image/")) return file;

  let source;
  try {
    source = await loadBitmap(file);
  } catch {
    return file;
  }

  const width = source.width;
  const height = source.height;
  if (!width || !height) return file;

  const scale = Math.min(1, maxDimension / Math.max(width, height));
  const targetWidth = Math.round(width * scale);
  const targetHeight = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext("2d");
  if (!context) return file;

  // JPEG has no transparency; paint white first so a transparent PNG does
  // not come out with a black background.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, targetWidth, targetHeight);
  context.drawImage(source, 0, 0, targetWidth, targetHeight);
  source.close?.();

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  if (!blob || blob.size >= file.size) return file;

  const baseName = (file.name || "photo").replace(/\.[^.]+$/, "");
  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
};

export default compressImage;
