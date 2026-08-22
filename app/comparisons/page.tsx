import type { Metadata } from "next";
import { getPopularComparisons } from "@/app/lib/api";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Breadcrumb from "@/app/components/Breadcrumb";
import PopularComparisons from "@/app/components/PopularComparisons";
import Link from "next/link";

export const revalidate = 60; // ISR validation time

export const metadata: Metadata = {
  title: "All Phone Comparisons | Zozo",
  description: "Browse our extensive list of all mobile phone comparisons. Compare prices, specs, and features side by side.",
  alternates: {
    canonical: "https://zozo.pk/comparisons",
  },
  openGraph: {
    title: "All Phone Comparisons | Zozo",
    description: "Browse our extensive list of all mobile phone comparisons. Compare prices, specs, and features side by side.",
    url: "https://zozo.pk/comparisons",
  },
};

export default async function ComparisonsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const pageParam = resolvedParams.page;
  const currentPage = typeof pageParam === 'string' ? parseInt(pageParam, 10) : 1;
  const validPage = isNaN(currentPage) || currentPage < 1 ? 1 : currentPage;
  
  // Fetch all popular comparisons (we fetch a large number, then paginate on server)
  // This keeps the HTML payload small and ensures fast client-side loading.
  const allComparisons = await getPopularComparisons(100);
  
  const itemsPerPage = 15;
  const totalItems = allComparisons?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  
  const startIndex = (validPage - 1) * itemsPerPage;
  const currentComparisons = allComparisons?.slice(startIndex, startIndex + itemsPerPage) || [];

  return (
    <>
      <Navbar />
      <main className="w-full bg-surface min-h-screen flex flex-col">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-6 w-full">
          <Breadcrumb
            items={[
              { label: "Phones", href: "/phones" },
              { label: "Compare", href: "/compare" },
              { label: "All Comparisons" },
            ]}
          />
        </div>
        
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-8 w-full flex-grow">
          {currentComparisons.length > 0 ? (
            <>
              <PopularComparisons comparisons={currentComparisons} title="All Phone Comparisons" />
              
              {/* Server-side Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  {validPage > 1 ? (
                    <Link
                      href={`/comparisons?page=${validPage - 1}`}
                      className="px-4 py-2 bg-surface-container-low text-text-main rounded-lg hover:bg-surface-container transition-colors font-medium text-sm border border-border-subtle"
                    >
                      Previous
                    </Link>
                  ) : (
                    <button disabled className="px-4 py-2 bg-surface-container-low text-text-main rounded-lg opacity-50 font-medium text-sm border border-border-subtle cursor-not-allowed">
                      Previous
                    </button>
                  )}
                  
                  <span className="text-sm font-medium text-text-muted">
                    Page {validPage} of {totalPages}
                  </span>
                  
                  {validPage < totalPages ? (
                    <Link
                      href={`/comparisons?page=${validPage + 1}`}
                      className="px-4 py-2 bg-surface-container-low text-text-main rounded-lg hover:bg-surface-container transition-colors font-medium text-sm border border-border-subtle"
                    >
                      Next
                    </Link>
                  ) : (
                    <button disabled className="px-4 py-2 bg-surface-container-low text-text-main rounded-lg opacity-50 font-medium text-sm border border-border-subtle cursor-not-allowed">
                      Next
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-text-main mb-4">No Comparisons Found</h2>
              <p className="text-text-muted">We couldn't find any phone comparisons at the moment.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
