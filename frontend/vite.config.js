import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // The service worker updates itself and takes over without asking.
      // A management app people keep open for hours must not sit on a
      // stale build waiting for every tab to close.
      registerType: "autoUpdate",
      includeAssets: ["favicon.png", "apple-touch-icon.png"],
      manifest: {
        name: "KN Agro",
        short_name: "KN Agro",
        description: "Sales, inventory and team management for KN Agro.",
        // Installed users land in the portal; the public site is still
        // reachable from it, but the app is what they installed it for.
        start_url: "/login",
        scope: "/",
        display: "standalone",
        orientation: "portrait-primary",
        background_color: "#F6F7F4",
        theme_color: "#174C2B",
        icons: [
          { src: "/pwa-192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-512.png", sizes: "512x512", type: "image/png" },
          // Kept separate from the plain icons, with a much wider safe
          // area: Android clips a maskable icon to a circle or squircle,
          // and reusing the tight-margin icon here would cut the wordmark.
          { src: "/pwa-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // The built shell is precached so the app opens offline. API
        // responses are deliberately NOT cached: this is live business
        // data — stock levels, order status, approvals — and serving a
        // stale figure that looks current is worse than failing to load.
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
        navigateFallbackDenylist: [/^\/api\//],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
      devOptions: {
        // ON in dev, because with it off the dev server never injects the
        // manifest link — so the browser never treats the app as
        // installable, never fires `beforeinstallprompt`, and the sidebar's
        // Install button can never appear while developing.
        enabled: true,
        // A module worker with no navigation fallback: it makes the app
        // installable without standing between the browser and Vite's own
        // module graph, which is what makes a dev service worker serve
        // stale code.
        type: "module",
        navigateFallback: undefined,
      },
    }),
  ],
  server: {
    host: "localhost",
    port: 5173,
    strictPort: true,
  },
  preview: {
    host: "localhost",
    port: 5173,
    strictPort: true,
  },
});
