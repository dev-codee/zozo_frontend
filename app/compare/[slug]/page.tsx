import { Metadata } from "next";
import { getPhones, getComparisonData, trackComparison, getPopularComparisons } from "@/app/lib/api";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Breadcrumb from "@/app/components/Breadcrumb";
import CompareClient from "@/app/components/CompareClient";
import PopularComparisons from "@/app/components/PopularComparisons";
import { notFound } from "next/navigation";

export const revalidate = 60; // ISR validation time

function parseCompareSlugs(slugParam: string): [string, string] | null {
  if (!slugParam) return null;
  const parts = slugParam.split("-vs-");
  if (parts.length >= 2) {
    const slug1 = parts[0];
    const slug2 = parts.slice(1).join("-vs-");
    if (slug1 && slug2) {
      return [slug1, slug2];
    }
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const parsedSlugs = parseCompareSlugs(resolvedParams.slug);

  if (parsedSlugs) {
    const comparisonPhones = await getComparisonData(parsedSlugs);
    if (comparisonPhones.length === 2) {
      const title = `${comparisonPhones[0].name} vs ${comparisonPhones[1].name} - Price & Specs Comparison`;
      const description = `Compare ${comparisonPhones[0].name} and ${comparisonPhones[1].name} prices, specifications, features, and detailed comparison in Pakistan.`;
      return { title, description };
    }
  }

  return {
    title: "Phone Comparison | Zozo",
    description: "Compare smartphone prices and specifications in Pakistan.",
  };
}

export default async function CompareCanonicalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const parsedSlugs = parseCompareSlugs(resolvedParams.slug);

  if (!parsedSlugs) {
    notFound();
  }

  const [slug1, slug2] = parsedSlugs;
  const selectedSlugs = [slug1, slug2];

  // Fetch data
  const [comparisonPhones, allPhones, popularComparisons] = await Promise.all([
    getComparisonData(selectedSlugs),
    getPhones("limit=all"),
    getPopularComparisons(8),
  ]);

  // Track this comparison
  if (comparisonPhones.length >= 2) {
    // Fire and forget
    trackComparison(selectedSlugs).catch(console.error);
  }

  return (
    <>
      <Navbar />
      <main className="w-full bg-surface">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-6">
          <Breadcrumb
            items={[
              { label: "Phones", href: "/phones" },
              { label: "Compare", href: "/compare" },
              {
                label:
                  comparisonPhones.length === 2
                    ? `${comparisonPhones[0].name} vs ${comparisonPhones[1].name}`
                    : `${slug1} vs ${slug2}`,
              },
            ]}
          />
        </div>

        <CompareClient initialPhones={comparisonPhones} allPhones={allPhones.phones} />

        <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-12">
          <PopularComparisons comparisons={popularComparisons} />
        </div>
      </main>
      <Footer />
    </>
  );
}
