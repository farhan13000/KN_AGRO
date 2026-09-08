import { useCallback, useEffect, useState } from "react";

/**
 * Whether this app can be installed right now, and how to do it.
 *
 * The browser fires `beforeinstallprompt` only when it considers the app
 * installable AND not already installed — so having a deferred prompt IS
 * the "can install" signal; nothing here needs to guess at it.
 *
 * Three things independently mean "don't offer it":
 *   - the browser never offered a prompt (already installed, or a browser
 *     that does not support installing — iOS Safari never fires this
 *     event, so there is no programmatic install to offer there);
 *   - the page is already RUNNING as an installed app, which
 *     `display-mode: standalone` reports (plus `navigator.standalone`,
 *     which is the only signal iOS gives);
 *   - the app was installed during this session, which fires `appinstalled`.
 *
 * The listeners are attached once and cleaned up on unmount; the deferred
 * event is kept because it can only be prompted with once, and only in
 * response to a real user gesture.
 */
const isRunningInstalled = () => {
  if (typeof window === "undefined") return false;
  const standaloneDisplay = window.matchMedia?.("(display-mode: standalone)")?.matches;
  // iOS Safari exposes this instead of the display-mode media query.
  const iosStandalone = window.navigator?.standalone === true;
  return Boolean(standaloneDisplay || iosStandalone);
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

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return "unavailable";

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    // The event is single-use: once prompted, it cannot be reused, so it
    // is dropped either way. If the person declined, the browser will
    // offer a fresh one on a later visit when it judges the moment right.
    window.__knAgroInstallPrompt = null;
    setDeferredPrompt(null);
    if (outcome === "accepted") setInstalled(true);
    return outcome;
  }, [deferredPrompt]);

  return {
    canInstall: Boolean(deferredPrompt) && !installed,
    installed,
    promptInstall,
  };
};
