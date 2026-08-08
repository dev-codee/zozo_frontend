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
  try {
    const decoded = decodeURIComponent(slugParam);
    const parts = decoded.split("-vs-");
    if (parts.length >= 2) {
      const slug1 = parts[0]?.trim();
      const slug2 = parts.slice(1).join("-vs-")?.trim();
      if (slug1 && slug2) {
        return [slug1, slug2];
      }
    }
  } catch (err) {
    console.error("Error parsing compare slugs:", err);
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const parsedSlugs = parseCompareSlugs(resolvedParams?.slug);

    if (parsedSlugs) {
      const comparisonPhones = await getComparisonData(parsedSlugs);
      if (comparisonPhones && comparisonPhones.length === 2) {
        const title = `${comparisonPhones[0].name} vs ${comparisonPhones[1].name} — Price & Specs Comparison`;
        const description = `Compare ${comparisonPhones[0].name} vs ${comparisonPhones[1].name} prices in Pakistan, full specifications, camera, battery, display, and features.`;
        const canonicalUrl = `https://zozo.pk/compare/${parsedSlugs[0]}-vs-${parsedSlugs[1]}`;
        const img1 = comparisonPhones[0].images?.[0]?.url;

        return {
          title,
          description,
          alternates: {
            canonical: canonicalUrl,
          },
          openGraph: {
            title,
            description,
            url: canonicalUrl,
            images: img1 ? [{ url: img1, alt: `${comparisonPhones[0].name} vs ${comparisonPhones[1].name}` }] : [],
          },
          twitter: {
            card: "summary_large_image",
            title,
            description,
            images: img1 ? [img1] : [],
          },
        };
      }
    }
  } catch (err) {
    console.error("Metadata generation error:", err);
  }

  return {
    title: "Phone Comparison — Compare Mobile Prices in Pakistan",
    description: "Compare smartphone prices and specifications side by side in Pakistan.",
    alternates: {
      canonical: "https://zozo.pk/compare",
    },
  };
}

export default async function CompareCanonicalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const parsedSlugs = parseCompareSlugs(resolvedParams?.slug);

  if (!parsedSlugs) {
    notFound();
  }

  const [slug1, slug2] = parsedSlugs;
  const selectedSlugs = [slug1, slug2];

  // Fetch data safely with Promise.allSettled
  const [comparisonPhonesResult, allPhonesResult, popularComparisonsResult] = await Promise.allSettled([
    getComparisonData(selectedSlugs),
    getPhones("limit=all"),
    getPopularComparisons(8),
  ]);

  const comparisonPhones =
    comparisonPhonesResult.status === "fulfilled" && Array.isArray(comparisonPhonesResult.value)
      ? comparisonPhonesResult.value
      : [];
  const allPhonesData =
    allPhonesResult.status === "fulfilled" && allPhonesResult.value
      ? allPhonesResult.value
      : { phones: [] };
  const popularComparisons =
    popularComparisonsResult.status === "fulfilled" && Array.isArray(popularComparisonsResult.value)
      ? popularComparisonsResult.value
      : [];

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

        <CompareClient initialPhones={comparisonPhones} allPhones={allPhonesData.phones || []} />

        <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-12">
          {popularComparisons && popularComparisons.length > 0 && (
            <PopularComparisons comparisons={popularComparisons} />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
