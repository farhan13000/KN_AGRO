import { useRef, useState } from "react";
import { ImagePlus, Star, Trash2 } from "lucide-react";
import { MEDIA_KIND, MEDIA_KIND_RULES, useMediaUpload } from "../../media";

const MAX_IMAGES = 10;

/**
 * Product photos picked from the device's gallery (or files on a
 * computer) and uploaded to the media store — never typed-in URLs.
 *
 * `value` is the product's images array ({ url, publicId }); the first one
 * is the primary image shown in lists and on the public site. `onChange`
 * receives the same `{ target: { name, value } }` shape as a native
 * input, so the form's single change handler keeps working.
 *
 * No `capture` attribute on the input: that would open the camera on a
 * phone, and the point here is choosing an existing photo.
 */
export default function ProductImagesField({ error, name = "images", onChange, value = [] }) {
  const inputRef = useRef(null);
  const upload = useMediaUpload(MEDIA_KIND.PRODUCT_IMAGE);
  const [pending, setPending] = useState({ done: 0, total: 0 });
  const images = Array.isArray(value) ? value : [];
  const rule = MEDIA_KIND_RULES[MEDIA_KIND.PRODUCT_IMAGE];

  const emit = (next) => onChange({ target: { name, value: next } });

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    // Allow picking the same photo again after removing it.
    event.target.value = "";
    const room = MAX_IMAGES - images.length;
    const selected = files.slice(0, Math.max(room, 0));
    if (!selected.length) return;

    let current = images;
    setPending({ done: 0, total: selected.length });
    // One at a time: phones are often on slow mobile data, and the
    // shared upload hook tracks a single upload's progress.
    for (const [index, file] of selected.entries()) {
      const uploaded = await upload.upload(file);
      if (uploaded?.url) {
        current = [...current, { url: uploaded.url, publicId: uploaded.publicId }];
        emit(current);
      }
      setPending({ done: index + 1, total: selected.length });
    }
    setPending({ done: 0, total: 0 });
  };

  const remove = (index) => emit(images.filter((_, i) => i !== index));
  const makePrimary = (index) => emit([images[index], ...images.filter((_, i) => i !== index)]);

  const isUploading = pending.total > 0;

  return (
    <div>
      <span className="form-label">Product Images</span>
      <p className="text-xs text-muted">
        Choose photos from your gallery. The first photo is the main image. Up to {MAX_IMAGES}. {rule?.label}
      </p>

      <input
        accept={rule?.accept || "image/*"}
        className="sr-only"
        data-product-images-input
        multiple
        onChange={handleFiles}
        ref={inputRef}
        type="file"
      />

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        {images.map((image, index) => (
          <div
            className="group relative aspect-square overflow-hidden rounded-lg border border-forest/15 bg-mint"
            data-product-image
            key={`${image.url}-${index}`}
          >
            <img alt={`Product image ${index + 1}`} className="h-full w-full object-contain p-1" src={image.url} />
            {index === 0 ? (
              <span className="absolute left-1.5 top-1.5 rounded-full bg-forest px-2 py-0.5 text-[10px] font-black text-white">
                Main
              </span>
            ) : null}
            <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-white/90 p-1">
              {index !== 0 ? (
                <button
                  aria-label={`Make image ${index + 1} the main image`}
                  className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-[11px] font-bold text-forest hover:bg-mint"
                  onClick={() => makePrimary(index)}
                  type="button"
                >
                  <Star className="h-3 w-3" />
                  Main
                </button>
              ) : (
                <span />
              )}
              <button
                aria-label={`Remove image ${index + 1}`}
                className="inline-flex items-center rounded px-1.5 py-1 text-red-700 hover:bg-red-50"
                onClick={() => remove(index)}
                type="button"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}

        {images.length < MAX_IMAGES ? (
          <button
            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-forest/25 bg-mint/30 p-2 text-center text-xs font-bold text-forest transition hover:bg-mint disabled:cursor-wait disabled:opacity-60"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
            type="button"
          >
            <ImagePlus className="h-7 w-7" />
            {isUploading ? `Uploading ${pending.done + 1} of ${pending.total}… ${upload.progress}%` : "Add from gallery"}
          </button>
        ) : null}
      </div>

      {upload.errorMessage ? <p className="form-error mt-2">{upload.errorMessage}</p> : null}
      {error ? <p className="form-error mt-2">{error}</p> : null}
    </div>
  );
}
