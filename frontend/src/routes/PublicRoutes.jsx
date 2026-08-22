import { lazy } from "react";
import PublicLayout from "../layouts/PublicLayout";
import { ROUTES } from "../shared/constants";

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
const NotFoundPage = lazy(() => import("./NotFoundPage"));

export const publicRouteConfig = {
  element: <PublicLayout />,
  children: [
    { path: ROUTES.PUBLIC.HOME, element: <HomePage /> },
    { path: ROUTES.PUBLIC.ABOUT, element: <AboutPage /> },
    { path: ROUTES.PUBLIC.PRODUCTS, element: <ProductsPage /> },
    { path: ROUTES.PUBLIC.PRODUCT_DETAILS, element: <ProductDetailsPage /> },
    { path: ROUTES.PUBLIC.CATEGORIES, element: <CategoriesPage /> },
    { path: ROUTES.PUBLIC.CATEGORY_DETAILS, element: <CategoryDetailsPage /> },
    { path: ROUTES.PUBLIC.CONTACT, element: <ContactPage /> },
    { path: ROUTES.PUBLIC.ENQUIRY, element: <EnquiryPage /> },
    { path: ROUTES.PUBLIC.PRIVACY_POLICY, element: <PrivacyPolicyPage /> },
    { path: ROUTES.PUBLIC.TERMS, element: <TermsPage /> },
    { path: ROUTES.ERROR.NOT_FOUND, element: <NotFoundPage /> },
  ],
};

