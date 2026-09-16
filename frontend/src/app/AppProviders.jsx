import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "../i18n/LanguageContext.jsx";
import { AuthProvider } from "../core/auth";
import { ToastProvider } from "../shared/feedback/ToastContext.jsx";

/**
 * Module scope, not per render — one cache for the app's lifetime.
 *
 * The two `false` defaults are not preferences, they preserve existing
 * behavior: v5 retries a failed query 3 times and refetches whenever the
 * window regains focus, while the hand-rolled hooks this replaced did
 * neither. Leaving the defaults on would have quietly tripled the
 * requests behind every failure and re-fired every query on tab focus.
 *
 * staleTime is the actual win: revisiting a screen within the window
 * reuses the cached result instead of refetching, and past it the cached
 * data still renders immediately while a refresh happens in the
 * background. An explicit refetch() (what mutation onSuccess handlers
 * already call) ignores staleTime, so existing refresh flows are
 * unaffected.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

export default function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <LanguageProvider>
          <ToastProvider>
            <AuthProvider>{children}</AuthProvider>
          </ToastProvider>
        </LanguageProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}
