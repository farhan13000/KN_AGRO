import { useEffect, useMemo, useState } from "react";
import Icon from "../../../shared/components/Icon";

const normalizeImages = (images) => {
  if (!images) return [];
  const list = Array.isArray(images) ? images : [images];
  return list
    .map((image) => {
      if (!image) return null;
      if (typeof image === "string") return { alt: "", url: image };
      return { alt: image.alt || "", isPrimary: Boolean(image.isPrimary), url: image.url || "" };
    })
    .filter((image) => image?.url);
};

export default function ProductImageDisplay({
  aspectRatio = "aspect-square",
  images,
  name = "Product",
  showGallery = true,
}) {
  const normalizedImages = useMemo(() => normalizeImages(images), [images]);
  const primaryImage = normalizedImages.find((image) => image.isPrimary) || normalizedImages[0] || null;
  const [selectedImage, setSelectedImage] = useState(primaryImage);
  const [failedUrls, setFailedUrls] = useState(() => new Set());

  useEffect(() => {
    setSelectedImage(primaryImage);
    setFailedUrls(new Set());
  }, [primaryImage]);

  const activeImage = selectedImage && !failedUrls.has(selectedImage.url) ? selectedImage : null;

  const markFailed = (url) => {
    setFailedUrls((current) => new Set([...current, url]));
  };

  return (
    <div className="w-full">
      <div
        className={`flex ${aspectRatio} w-full items-center justify-center overflow-hidden rounded-lg border border-forest/10 bg-mint`}
      >
        {activeImage ? (
          <img
            alt={activeImage.alt || `${name} product image`}
            className="h-full w-full object-contain p-4"
            loading="lazy"
            onError={() => markFailed(activeImage.url)}
            src={activeImage.url}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center text-forest">
            <Icon name="PackageCheck" className="h-10 w-10" />
            <span className="text-sm font-bold">Product image unavailable</span>
          </div>
        )}
      </div>

      {showGallery && normalizedImages.length > 1 ? (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {normalizedImages.map((image) => {
            const isActive = activeImage?.url === image.url;
            const isBroken = failedUrls.has(image.url);

            return (
              <button
                aria-label={`View ${name} image`}
                className={`flex aspect-square items-center justify-center overflow-hidden rounded-md border-2 bg-white ${
                  isActive ? "border-forest" : "border-transparent hover:border-forest/30"
                }`}
                disabled={isBroken}
                key={image.url}
                onClick={() => setSelectedImage(image)}
                type="button"
              >
                {isBroken ? (
                  <Icon name="PackageCheck" className="h-5 w-5 text-muted" />
                ) : (
                  <img
                    alt=""
                    className="h-full w-full object-contain p-1"
                    loading="lazy"
                    onError={() => markFailed(image.url)}
                    src={image.url}
                  />
                )}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
