import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import SkeletonCard from "../shared/components/SkeletonCard";

const HomePage = lazy(() => import("../modules/public/home/pages/HomePage"));
const AboutPage = lazy(() => import("../modules/public/about/pages/AboutPage"));
const ProductsPage = lazy(() => import("../modules/public/products/pages/ProductsPage"));
const ProductDetailsPage = lazy(() => import("../modules/public/products/pages/ProductDetailsPage"));
const CategoriesPage = lazy(() => import("../modules/public/categories/pages/CategoriesPage"));
const CategoryDetailsPage = lazy(() => import("../modules/public/categories/pages/CategoryDetailsPage"));
const ContactPage = lazy(() => import("../modules/public/contact/pages/ContactPage"));
const EnquiryPage = lazy(() => import("../modules/public/enquiries/pages/EnquiryPage"));
const PrivacyPolicyPage = lazy(() => import("../modules/public/legal/pages/PrivacyPolicyPage"));
const TermsPage = lazy(() => import("../modules/public/legal/pages/TermsPage"));
const NotFoundPage = lazy(() => import("../routes/NotFoundPage"));

function PageFallback() {
  return (
    <div className="site-container py-16">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </div>
  );
}

const withSuspense = (element) => <Suspense fallback={<PageFallback />}>{element}</Suspense>;

export const publicRoutes = [
  { path: "/", element: withSuspense(<HomePage />) },
  { path: "/about", element: withSuspense(<AboutPage />) },
  { path: "/products", element: withSuspense(<ProductsPage />) },
  { path: "/products/:slug", element: withSuspense(<ProductDetailsPage />) },
  { path: "/categories", element: withSuspense(<CategoriesPage />) },
  { path: "/categories/:slug", element: withSuspense(<CategoryDetailsPage />) },
  { path: "/contact", element: withSuspense(<ContactPage />) },
  { path: "/enquiry", element: withSuspense(<EnquiryPage />) },
  { path: "/privacy-policy", element: withSuspense(<PrivacyPolicyPage />) },
  { path: "/terms", element: withSuspense(<TermsPage />) },
  { path: "*", element: withSuspense(<NotFoundPage />) },
];

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: publicRoutes,
  },
]);
