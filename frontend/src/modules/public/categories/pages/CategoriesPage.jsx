import CategoryCard from "../../../../shared/components/CategoryCard";
import EmptyState from "../../../../shared/components/EmptyState";
import PageHero from "../../../../shared/components/PageHero";
import SEO from "../../../../shared/components/SEO";
import SkeletonCard from "../../../../shared/components/SkeletonCard";
import { usePublicData } from "../../../../hooks/usePublicData";
import { heroImages } from "../../data/company.data";
import { publicCategoriesApi } from "../api/publicCategories.api";

export default function CategoriesPage() {
  const categoryState = usePublicData(publicCategoriesApi.getCategories, []);

  return (
    <>
      <SEO
        description="Explore KN Agro product categories including bio fertilizers, organic fertilizers, micronutrients, growth promoters and soil conditioners."
        image={heroImages.seedlings}
        path="/categories"
        title="Product Categories"
      />
      <PageHero
        breadcrumbs={[{ label: "Categories" }]}
        description="Browse KN Agro's product categories and find suitable agricultural inputs for soil, nutrition, growth and business needs."
        eyebrow="Catalogue Categories"
        image={heroImages.seedlings}
        title="Agricultural Input Categories"
      />
      <section className="section-padding">
        <div className="site-container">
          {categoryState.isError ? (
            <EmptyState description={categoryState.error} title="Unable to load categories" />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {categoryState.isLoading
                ? Array.from({ length: 8 }).map((_, index) => <SkeletonCard key={index} />)
                : categoryState.data?.map((category) => <CategoryCard category={category} key={category.id} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
