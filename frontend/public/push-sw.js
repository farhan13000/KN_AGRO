/* eslint-env serviceworker */
/* global clients */

/**
 * THE PUSH HALF OF THE SERVICE WORKER.
 *
 * Pulled into the Workbox-generated worker by `workbox.importScripts` in
 * vite.config.js rather than replacing it. That choice is the whole point
 * of this file being separate: switching the PWA plugin to injectManifest
 * would hand us the precaching, update and offline behaviour to maintain
 * by hand, all of which already works. This adds two event listeners to
 * it and touches nothing else.
 *
 * Runs with no app, no React and no router — it is woken by the operating
 * system when a push arrives, often with every tab closed. So it does the
 * least it possibly can: show the banner, and on a tap hand the
 * notification's id to the app and let the app decide where that leads.
 */

const FALLBACK_TITLE = "KN Agro";

self.addEventListener("push", (event) => {
  // A push with no body at all is rare but real (some services send one
  // to keep a subscription warm). Showing a generic banner beats showing
  // the browser's own "This site has been updated in the background",
  // which is what appears if a push event is handled without a
  // notification.
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }

  const title = data.title || FALLBACK_TITLE;
  const options = {
    body: data.body || "You have a new notification.",
    icon: "/pwa-192.png",
    badge: "/pwa-192.png",
    // Per notification, so two different things never collapse into one
    // banner — but a repeat of the SAME notification replaces rather than
    // stacks, which is what `tag` is for.
    tag: data.notificationId ? `kn-${data.notificationId}` : undefined,
    renotify: Boolean(data.notificationId),
    data: {
      notificationId: data.notificationId || null,
      module: data.module || null,
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const notificationId = event.notification.data?.notificationId;
  // `?n=` is read once by the app, which then resolves it through the
  // SAME actionKey-to-route logic the notification bell already uses.
  // Working the destination out here would mean a second copy of that
  // mapping living in a file that cannot import it.
  const target = notificationId ? `/?n=${notificationId}` : "/";

  event.waitUntil(
    (async () => {
      const windows = await clients.matchAll({ type: "window", includeUncontrolled: true });

      // Reuse a tab that is already open rather than opening a second
      // copy of the app — someone tapping a notification on their phone
      // expects to land in the app they have, not a new one.
      for (const client of windows) {
        if ("focus" in client) {
          await client.focus();
          if (notificationId && "postMessage" in client) {
            client.postMessage({ type: "KN_NOTIFICATION_CLICK", notificationId });
            return;
          }
          if (!notificationId) return;
        }
      }

      if (clients.openWindow) await clients.openWindow(target);
    })(),
  );
});

/**
 * Browsers rotate a push subscription occasionally, and when they do the
 * old endpoint stops working. Without this the person quietly stops
 * getting notifications and has no way of knowing why.
 *
 * The app cannot be asked to re-subscribe from here (there is no token in
 * a service worker), so this tells any open tab to do it. A closed app
 * picks it up on next launch instead, because the app re-subscribes on
 * every start anyway.
 */
self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    (async () => {
      const windows = await clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of windows) client.postMessage({ type: "KN_PUSH_RESUBSCRIBE" });
    })(),
  );
});
