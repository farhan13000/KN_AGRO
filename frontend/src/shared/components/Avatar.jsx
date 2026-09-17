import { useEffect, useState } from "react";

/**
 * A person's face, wherever a person is named.
 *
 * Falls back to their initials — not a generic silhouette — when there
 * is no photo or the stored one fails to load, so a row never shows a
 * blank hole and two people are still told apart at a glance.
 */
const SIZES = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-[11px]",
  md: "h-10 w-10 text-xs",
  lg: "h-16 w-16 text-lg",
  xl: "h-28 w-28 text-3xl",
};

export const initialsOf = (name = "") =>
  String(name)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

export default function Avatar({ className = "", name = "", size = "sm", src = "" }) {
  const [broken, setBroken] = useState(false);

  // A new photo (same component, different URL) deserves another try.
  useEffect(() => setBroken(false), [src]);

  const shape = `inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-mint font-black text-forest ring-1 ring-forest/15 ${
    SIZES[size] || SIZES.sm
  } ${className}`;

  if (src && !broken) {
    return (
      <img
        alt={name ? `${name} photo` : "Profile photo"}
        className={`${shape} object-cover`}
        loading="lazy"
        onError={() => setBroken(true)}
        src={src}
      />
    );
  }

  return (
    <span className={shape} title={name || undefined}>
      {initialsOf(name)}
    </span>
  );
}
