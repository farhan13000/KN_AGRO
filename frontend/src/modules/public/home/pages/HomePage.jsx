import SEO from "../../../../shared/components/SEO";
import { usePublicData } from "../../../../hooks/usePublicData";
import { websiteContentApi } from "../../api/websiteContent.api";
import { publicCategoriesApi } from "../../categories/api/publicCategories.api";
import { publicProductsApi } from "../../products/api/publicProducts.api";
import AboutPreviewSection from "../components/AboutPreviewSection";
import CategorySolutionsSection from "../components/CategorySolutionsSection";
import FeaturedProductsSection from "../components/FeaturedProductsSection";
import HeroSection from "../components/HeroSection";
import TestimonialsSection from "../components/TestimonialsSection";
import WhyChooseSection from "../components/WhyChooseSection";

export default function HomePage() {
  const content = usePublicData(websiteContentApi.getHomeContent, []);
  const categoryState = usePublicData(publicCategoriesApi.getCategories, []);
  const productState = usePublicData(publicProductsApi.getFeaturedProducts, []);
  const featuredProducts = productState.data || [];

  return (
    <>
      <SEO
        description="KN Agro supplies quality bio fertilizers, organic fertilizers, micronutrients, growth promoters and agricultural inputs through a professional catalogue and enquiry website."
        image={content.data?.heroImages?.field}
        path="/"
        title="Agricultural Inputs and Product Enquiries"
      />
      <HeroSection />
      <CategorySolutionsSection categories={categoryState.data || []} isLoading={categoryState.isLoading} />
      <FeaturedProductsSection isLoading={productState.isLoading} products={featuredProducts} />
      <WhyChooseSection advantages={content.data?.businessAdvantages || []} />
      <AboutPreviewSection />
      <TestimonialsSection testimonials={content.data?.testimonials || []} />
    </>
  );
}
