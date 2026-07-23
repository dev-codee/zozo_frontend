import { getPhones, getComparisonData, getPopularComparisons } from "@/app/lib/api";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Breadcrumb from "@/app/components/Breadcrumb";
import CompareClient from "@/app/components/CompareClient";
import PopularComparisons from "@/app/components/PopularComparisons";

export const revalidate = 60; // ISR validation time

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const rawPhones = resolvedParams.phone;

  // Process slugs from search query parameter (?phone=slug1&phone=slug2)
  let selectedSlugs: string[] = [];
  if (rawPhones) {
    selectedSlugs = Array.isArray(rawPhones) ? rawPhones : [rawPhones];
  } else if (resolvedParams.slugs) {
    selectedSlugs = typeof resolvedParams.slugs === "string" ? resolvedParams.slugs.split(",") : [];
  }

  // Clean empty values
  selectedSlugs = selectedSlugs.map((s) => s.trim()).filter((s) => s.length > 0);

  // Redirect to canonical URL if exactly 2 phones are compared
  if (selectedSlugs.length === 2) {
    const { redirect } = await import("next/navigation");
    redirect(`/compare/${selectedSlugs[0]}/vs/${selectedSlugs[1]}`);
  }

  // Fetch full details of the compared phones and summary of all phones for dropdown
  const [comparisonPhones, allPhones, popularComparisons] = await Promise.all([
    getComparisonData(selectedSlugs),
    getPhones("limit=all"),
    getPopularComparisons(8)
  ]);

  return (
    <>
      <Navbar />
      <main className="w-full bg-surface">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-6">
          <Breadcrumb
            items={[
              { label: "Phones", href: "/phones" },
              { label: "Compare" },
            ]}
          />
        </div>
        <CompareClient initialPhones={comparisonPhones} allPhones={allPhones} />
        
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
