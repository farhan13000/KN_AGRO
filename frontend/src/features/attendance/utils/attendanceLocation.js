/**
 * The device position for check-in/out, via the browser Geolocation API.
 *
 * Browsers only expose this on HTTPS (or localhost) and only after the
 * person allows it. `maximumAge: 0` refuses a cached position, so the
 * point is where they are now, not where the phone last was.
 */
export const requestCurrentLocation = () =>
  new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject({ code: "UNSUPPORTED" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Number.isFinite(position.coords.accuracy) ? position.coords.accuracy : undefined,
        }),
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
    );
  });

/** GeolocationPositionError codes: 1 denied, 2 unavailable, 3 timeout. */
export const describeLocationError = (error) => {
  if (error?.code === "UNSUPPORTED") {
    return "This browser cannot share location. Open the app in Chrome on your phone.";
  }
  if (error?.code === 1) {
    return "Location access is blocked. Allow location for this site in the browser settings, then tap Retry.";
  }
  if (error?.code === 3) {
    return "Getting your location took too long. Turn on GPS and tap Retry.";
  }
  return "Your location could not be found. Turn on GPS / location and tap Retry.";
};
