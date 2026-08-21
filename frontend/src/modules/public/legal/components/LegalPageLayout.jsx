import PageHero from "../../../../shared/components/PageHero";
import SEO from "../../../../shared/components/SEO";
import { heroImages } from "../../data/company.data";

export default function LegalPageLayout({ title, description, path, children }) {
  return (
    <>
      <SEO description={description} image={heroImages.field} path={path} title={title} />
      <PageHero
        breadcrumbs={[{ label: title }]}
        description={description}
        eyebrow="Legal Information"
        image={heroImages.field}
        title={title}
      />
      <section className="section-padding bg-white">
        <div className="site-container">
          <article className="mx-auto max-w-4xl rounded-[2rem] border border-forest/10 bg-white p-6 shadow-card sm:p-10">
            <div className="prose prose-green max-w-none">{children}</div>
          </article>
        </div>
      </section>
    </>
  );
}
