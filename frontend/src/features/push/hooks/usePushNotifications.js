import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage } from "../../../core/api";
import { pushApi } from "../services";
import { describeDevice, describePushSupport, urlBase64ToUint8Array } from "../utils/pushSupport";

/**
 * Turning notifications on for THIS device, and keeping that true.
 *
 * Three separate facts get confused constantly and are kept apart here:
 *   - what the BROWSER can do (support)
 *   - what the PERSON allowed (permission)
 *   - whether this device is registered with OUR server (subscribed)
 * All three must hold. Permission can be "granted" with no subscription
 * at all — the browser remembers the answer across a cleared site — so
 * the button is driven by `subscribed`, never by permission alone.
 *
 * PERMISSION IS ONLY EVER REQUESTED FROM A CLICK. Asking on page load is
 * how an app gets permanently blocked: people dismiss what they did not
 * ask for, and undoing "Block" means a trip into browser settings that
 * nobody makes. So nothing here fires on mount except reading state.
 */
export const usePushNotifications = () => {
  const support = describePushSupport();

  const [permission, setPermission] = useState(() =>
    typeof Notification === "undefined" ? "default" : Notification.permission,
  );
  const [subscribed, setSubscribed] = useState(false);
  const [preferences, setPreferences] = useState(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const readCurrentSubscription = useCallback(async () => {
    if (!support.supported) return null;
    const registration = await navigator.serviceWorker.ready;
    return registration.pushManager.getSubscription();
  }, [support.supported]);

  const refresh = useCallback(async () => {
    try {
      const [existing, prefs] = await Promise.all([
        readCurrentSubscription(),
        pushApi.getPreferences().catch(() => null),
      ]);
      setSubscribed(Boolean(existing));
      if (prefs) setPreferences(prefs);
    } catch {
      // Reading state must never break the screen it is on.
    }
  }, [readCurrentSubscription]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /**
   * Registers this device. Safe to call when already subscribed — the
   * browser hands back the same subscription and the server upserts on
   * the endpoint, so this doubles as the "make sure the server still
   * knows about me" call.
   */
  const enable = useCallback(async () => {
    setError("");
    setMessage("");
    setIsBusy(true);
    try {
      const granted = await Notification.requestPermission();
      setPermission(granted);
      if (granted !== "granted") {
        setError(
          granted === "denied"
            ? "Notifications are blocked for this site. Allow them in your browser settings, then try again."
            : "Notifications were not allowed.",
        );
        return false;
      }

      const { publicKey } = await pushApi.getPublicKey();
      const registration = await navigator.serviceWorker.ready;

      const subscription =
        (await registration.pushManager.getSubscription()) ||
        (await registration.pushManager.subscribe({
          // Required by every browser: a push may not be sent without
          // showing the person something. We always show a banner, so
          // this costs us nothing.
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        }));

      const json = subscription.toJSON();
      await pushApi.subscribe({
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
        deviceLabel: describeDevice(),
      });

      setSubscribed(true);
      setMessage("Notifications are on for this device.");
      await refresh();
      return true;
    } catch (caught) {
      setError(getApiErrorMessage(caught));
      return false;
    } finally {
      setIsBusy(false);
    }
  }, [refresh]);

  /**
   * Unsubscribes the browser AND tells the server, in that order. Doing
   * only the first would leave the server sending to a dead endpoint
   * until it errored its way to deletion; doing only the second would
   * leave the browser holding a subscription it would hand straight back
   * on the next "enable".
   */
  const disable = useCallback(async () => {
    setError("");
    setMessage("");
    setIsBusy(true);
    try {
      const subscription = await readCurrentSubscription();
      if (subscription) {
        const { endpoint } = subscription.toJSON();
        await subscription.unsubscribe();
        await pushApi.unsubscribe(endpoint).catch(() => {
          // The browser has already stopped; a failed server call only
          // means one dead endpoint, which the sender cleans up itself.
        });
      }
      setSubscribed(false);
      setMessage("Notifications are off for this device.");
      await refresh();
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    } finally {
      setIsBusy(false);
    }
  }, [readCurrentSubscription, refresh]);

  const setModule = useCallback(async (module, value) => {
    setError("");
    setMessage("");
    // Moved on screen first, then saved: a switch that waits for a round
    // trip before it moves feels broken. Rolled back below if the save
    // fails.
    setPreferences((current) =>
      current ? { ...current, modules: { ...current.modules, [module]: value } } : current,
    );
    try {
      const saved = await pushApi.updatePreferences({ modules: { [module]: value } });
      setPreferences(saved);
    } catch (caught) {
      setError(getApiErrorMessage(caught));
      setPreferences((current) =>
        current ? { ...current, modules: { ...current.modules, [module]: !value } } : current,
      );
    }
  }, []);

  const setEnabled = useCallback(async (value) => {
    setError("");
    setMessage("");
    // Moved first, then saved — same as the module switches above. Left
    // waiting on the round trip, the master switch does not budge when
    // pressed, which on a slow connection reads as a broken control and
    // gets pressed again.
    setPreferences((current) => (current ? { ...current, enabled: value } : current));
    try {
      setPreferences(await pushApi.updatePreferences({ enabled: value }));
    } catch (caught) {
      setError(getApiErrorMessage(caught));
      setPreferences((current) => (current ? { ...current, enabled: !value } : current));
    }
  }, []);

  const sendTest = useCallback(async () => {
    setError("");
    setMessage("");
    setIsBusy(true);
    try {
      await pushApi.sendTest();
      setMessage("Sent. It should appear in a moment.");
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    } finally {
      setIsBusy(false);
    }
  }, []);

  /**
   * The service worker asks for this when the browser rotates a
   * subscription out from under us, and when someone taps a notification
   * while the app is already open.
   */
  useEffect(() => {
    if (!support.supported) return undefined;

    const onMessage = (event) => {
      if (event.data?.type === "KN_PUSH_RESUBSCRIBE") enable();
    };
    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, [enable, support.supported]);

  return {
    support,
    permission,
    subscribed,
    preferences,
    isBusy,
    error,
    message,
    enable,
    disable,
    setModule,
    setEnabled,
    sendTest,
    refresh,
  };
};
