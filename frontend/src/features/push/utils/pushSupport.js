/**
 * What this browser can actually do, and — when it cannot — why, in words
 * the person can act on.
 *
 * The iPhone case is the one that matters most here. Safari on iOS has
 * supported web push since 16.4, but ONLY for a site added to the Home
 * Screen: in a normal Safari tab the API is simply absent, and the person
 * has no way of guessing that installing the app is what unlocks it. So
 * that case is detected and named rather than lumped into a flat "your
 * browser does not support notifications", which would be both unhelpful
 * and, for them, untrue.
 */
export const isStandalone = () =>
  window.matchMedia?.("(display-mode: standalone)")?.matches ||
  // Safari's own, non-standard flag for a Home Screen app.
  window.navigator?.standalone === true;

const isAppleMobile = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  // iPadOS 13+ reports itself as a Mac; the touch points give it away.
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

export const describePushSupport = () => {
  const hasApi = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

  if (hasApi) return { supported: true, reason: "" };

  if (isAppleMobile() && !isStandalone()) {
    return {
      supported: false,
      needsInstall: true,
      reason:
        "On an iPhone or iPad, notifications only work once the app is installed. Use Share → Add to Home Screen, open KN Agro from your home screen, and turn them on there.",
    };
  }

  return {
    supported: false,
    needsInstall: false,
    reason: "This browser cannot show notifications. Try Chrome on Android, or Chrome or Edge on a computer.",
  };
};

/**
 * The VAPID public key arrives as base64url text and `PushManager.
 * subscribe` insists on raw bytes. Nothing clever — just the conversion
 * the API refuses to do for you.
 */
export const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
};

/** "Chrome on Android" — so a person can tell their own devices apart. */
export const describeDevice = () => {
  const ua = navigator.userAgent;
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\//.test(ua)
      ? "Opera"
      : /Chrome\//.test(ua)
        ? "Chrome"
        : /Firefox\//.test(ua)
          ? "Firefox"
          : /Safari\//.test(ua)
            ? "Safari"
            : "Browser";
  const platform = /Android/.test(ua)
    ? "Android"
    : isAppleMobile()
      ? "iPhone"
      : /Macintosh/.test(ua)
        ? "Mac"
        : /Windows/.test(ua)
          ? "Windows"
          : "this device";

  return `${browser} on ${platform}`;
};
