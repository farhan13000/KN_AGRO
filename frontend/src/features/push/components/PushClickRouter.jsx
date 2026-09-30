import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../core/auth";
import { notificationApi } from "../../notifications/services";
import { resolveNotificationRoute } from "../../notifications/utils/notificationDestination";

/**
 * WHERE A TAPPED NOTIFICATION LANDS.
 *
 * The service worker cannot work this out: it has no router, no role and
 * no way to import the app's own actionKey-to-route map. So it does the
 * only thing it can — hands over the notification's id, either as `?n=`
 * on a cold start or as a postMessage into an app that was already open —
 * and this resolves it here, through the SAME
 * `resolveNotificationRoute` the bell already uses. One mapping, not two
 * that drift.
 *
 * Marking it read is the same call that fetches it, which is exactly
 * right: tapping a notification IS reading it, and doing both in one
 * request means the bell's badge is already correct by the time the
 * screen it points at has rendered.
 *
 * Mounted once, high in the tree. Renders nothing.
 */
export default function PushClickRouter() {
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  // One id, handled once. Without this a re-render after navigation would
  // send the person back again, and they could never leave the page.
  const handledRef = useRef("");

  useEffect(() => {
    if (!user) return undefined;

    const open = async (notificationId) => {
      if (!notificationId || handledRef.current === notificationId) return;
      handledRef.current = notificationId;

      try {
        const { notification } = await notificationApi.markNotificationRead(notificationId);
        const route = resolveNotificationRoute(notification, role);
        // A notification with no screen to open (a type whose module has
        // no detail page) still counts as read — it simply leaves the
        // person where they are rather than bouncing them somewhere
        // arbitrary.
        if (route) navigate(route);
      } catch {
        // A notification that has been archived, or belongs to someone
        // else, resolves to nothing. Opening the app was still the right
        // outcome of the tap.
      }
    };

    // Cold start: the service worker opened the app at /?n=<id>. The
    // parameter is stripped immediately so a refresh, or a shared link,
    // does not replay it.
    const fromUrl = searchParams.get("n");
    if (fromUrl) {
      const next = new URLSearchParams(searchParams);
      next.delete("n");
      setSearchParams(next, { replace: true });
      open(fromUrl);
    }

    // Warm start: the app was already open, so the worker messaged it.
    const onMessage = (event) => {
      if (event.data?.type === "KN_NOTIFICATION_CLICK") open(event.data.notificationId);
    };
    navigator.serviceWorker?.addEventListener?.("message", onMessage);
    return () => navigator.serviceWorker?.removeEventListener?.("message", onMessage);
  }, [navigate, role, searchParams, setSearchParams, user]);

  return null;
}
