import { useCallback, useEffect, useState } from "react";

/**
 * Whether this app can be installed right now, and how to do it.
 *
 * Two very different install paths exist:
 *
 *  - "prompt": Chrome, Edge, Samsung Internet… fire `beforeinstallprompt`
 *    when they consider the app installable and not yet installed. Having
 *    that deferred event IS the "can install" signal, and calling
 *    `prompt()` on it opens the browser's own install dialog.
 *
 *  - "ios" / "mac-safari": Apple never fires that event, and offers no
 *    API to trigger an install. On iPhone/iPad the only way is Share →
 *    "Add to Home Screen"; on a Mac, Safari's File → "Add to Dock". So on
 *    Apple devices the button is always offered (unless already running
 *    installed) and pressing it returns "manual", for the caller to show
 *    those steps instead.
 *
 * "Already installed" is `display-mode: standalone`, plus
 * `navigator.standalone`, the only signal iOS gives. `appinstalled` covers
 * an install during this session on the prompt path.
 */
const isRunningInstalled = () => {
  if (typeof window === "undefined") return false;
  const standaloneDisplay = window.matchMedia?.("(display-mode: standalone)")?.matches;
  // iOS Safari exposes this instead of the display-mode media query.
  const iosStandalone = window.navigator?.standalone === true;
  return Boolean(standaloneDisplay || iosStandalone);
};

/**
 * "ios" for iPhone/iPad/iPod — including iPadOS, which by default reports
 * itself as a Mac and is told apart only by having a touch screen.
 * "mac-safari" for Safari on a Mac (not Chrome/Edge/Firefox there, which
 * either fire the prompt or cannot install). Otherwise null.
 */
export const detectAppleInstallPlatform = () => {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent || "";
  const isTouchMac = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  if (/iPad|iPhone|iPod/.test(ua) || isTouchMac) return "ios";

  const isMac = /Macintosh/.test(ua);
  const isSafari = /Safari\//.test(ua) && !/Chrome\/|Chromium\/|Edg\/|OPR\/|Firefox\//.test(ua);
  return isMac && isSafari ? "mac-safari" : null;
};

/**
 * Which iOS browser this is, because the steps differ: Safari's Share
 * button is in the bottom bar, Chrome/Edge put Share in the address bar,
 * and apps' built-in browsers (Instagram, Facebook, WhatsApp…) cannot add
 * to the Home Screen at all.
 */
export const detectIosBrowser = () => {
  if (typeof navigator === "undefined") return "safari";
  const ua = navigator.userAgent || "";
  if (/FBAN|FBAV|Instagram|Line\/|WhatsApp|Snapchat|GSA\//.test(ua)) return "in-app";
  if (/CriOS/.test(ua)) return "chrome";
  if (/EdgiOS/.test(ua)) return "edge";
  if (/FxiOS/.test(ua)) return "firefox";
  return "safari";
};

export const useInstallPrompt = () => {
  // Seeded from the event index.html parked for us. The browser usually
  // fires `beforeinstallprompt` before React has mounted anything, so a
  // hook that only ever LISTENS misses it entirely — the symptom being an
  // install icon in the browser's address bar while the app's own button
  // never appears.
  const [deferredPrompt, setDeferredPrompt] = useState(
    () => (typeof window === "undefined" ? null : window.__knAgroInstallPrompt || null),
  );
  const [installed, setInstalled] = useState(isRunningInstalled);
  const [applePlatform] = useState(detectAppleInstallPlatform);

  useEffect(() => {
    const onBeforeInstallPrompt = (event) => {
      // Chrome shows its own mini-infobar unless this is prevented; the
      // point of keeping the event is to offer the install where it makes
      // sense in the UI instead.
      event.preventDefault();
      window.__knAgroInstallPrompt = event;
      setDeferredPrompt(event);
    };

    // Fired by that same early capture, for the case where it lands
    // between this component rendering and this effect running.
    const onParked = () => setDeferredPrompt(window.__knAgroInstallPrompt || null);

    const onInstalled = () => {
      setInstalled(true);
      window.__knAgroInstallPrompt = null;
      setDeferredPrompt(null);
    };

    // One last look, in case it arrived while this effect was being set up.
    if (!deferredPrompt && window.__knAgroInstallPrompt) {
      setDeferredPrompt(window.__knAgroInstallPrompt);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("knagro:installready", onParked);
    window.addEventListener("appinstalled", onInstalled);

    // Also react to the app being launched standalone in this same tab.
    const media = window.matchMedia?.("(display-mode: standalone)");
    const onDisplayChange = (event) => setInstalled(event.matches);
    media?.addEventListener?.("change", onDisplayChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("knagro:installready", onParked);
      window.removeEventListener("appinstalled", onInstalled);
      media?.removeEventListener?.("change", onDisplayChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The real prompt wins when a browser offers one (e.g. a future Safari).
  const installMode = installed ? null : deferredPrompt ? "prompt" : applePlatform;

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return applePlatform ? "manual" : "unavailable";

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    // The event is single-use: once prompted, it cannot be reused, so it
    // is dropped either way. If the person declined, the browser will
    // offer a fresh one on a later visit when it judges the moment right.
    window.__knAgroInstallPrompt = null;
    setDeferredPrompt(null);
    if (outcome === "accepted") setInstalled(true);
    return outcome;
  }, [applePlatform, deferredPrompt]);

  return {
    canInstall: Boolean(installMode),
    installMode,
    installed,
    promptInstall,
  };
};
