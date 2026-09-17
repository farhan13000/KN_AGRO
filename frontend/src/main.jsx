import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App.jsx";
import "./index.css";

// Vite dispatches this on `window` when a dynamically-imported chunk
// (every page in this app is lazy-loaded — see AppRouter.jsx) fails to
// fetch. Almost always: this tab has been open since before a deploy, so
// its already-running JS still references that build's chunk filenames —
// Vite hashes each chunk to its content, and a new deploy's build removes
// the old files outright, so the browser asks the server for a file that
// no longer exists. A full reload fetches the current index.html, which
// references the current, actually-existing filenames, and resolves it.
//
// Guarded to fire at most once per tab: if reloading doesn't fix it (a
// real outage, not a stale chunk), retrying forever would hang the tab in
// a reload loop instead of ever showing the user anything. If it happens
// again later in the same long-lived tab, RootErrorBoundary's manual
// Reload button is still there as the fallback.
window.addEventListener("vite:preloadError", () => {
  const alreadyReloaded = window.sessionStorage.getItem("kn-agro-preload-reload");
  if (alreadyReloaded) return;
  window.sessionStorage.setItem("kn-agro-preload-reload", "1");
  window.location.reload();
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
