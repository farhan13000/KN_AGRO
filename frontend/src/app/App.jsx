import { RouterProvider } from "react-router-dom";
import AppProviders from "./AppProviders.jsx";
import GlobalFetchIndicator from "../shared/components/GlobalFetchIndicator.jsx";
import { router } from "./router.jsx";

export default function App() {
  return (
    <AppProviders>
      <GlobalFetchIndicator />
      <RouterProvider router={router} />
    </AppProviders>
  );
}
