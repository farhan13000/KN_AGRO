import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "../i18n/LanguageContext.jsx";
import { ToastProvider } from "../shared/feedback/ToastContext.jsx";

export default function AppProviders({ children }) {
  return (
    <HelmetProvider>
      <LanguageProvider>
        <ToastProvider>{children}</ToastProvider>
      </LanguageProvider>
    </HelmetProvider>
  );
}
