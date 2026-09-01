import type { Metadata } from "next";
import { getPopularVehicleComparisons } from "@/app/lib/api";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Breadcrumb from "@/app/components/Breadcrumb";
import PopularVehicleComparisons from "@/app/components/PopularVehicleComparisons";
import Link from "next/link";

export const revalidate = 60; // ISR validation time

export const metadata: Metadata = {
  title: "All EV Comparisons | Zozo",
  description:
    "Browse our full list of electric vehicle comparisons. Compare EV prices, range, charging, and specs side by side in Pakistan.",
  alternates: {
    canonical: "https://zozo.pk/vehicles/comparisons",
  },
  openGraph: {
    title: "All EV Comparisons | Zozo",
    description:
      "Browse our full list of electric vehicle comparisons. Compare EV prices, range, charging, and specs side by side in Pakistan.",
    url: "https://zozo.pk/vehicles/comparisons",
  },
};

export default async function VehicleComparisonsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const pageParam = resolvedParams.page;
  const currentPage = typeof pageParam === "string" ? parseInt(pageParam, 10) : 1;
  const validPage = isNaN(currentPage) || currentPage < 1 ? 1 : currentPage;

  // Fetch a large batch of saved comparisons, then paginate on the server so the
  // HTML payload stays small.
  const allComparisons = await getPopularVehicleComparisons(100);

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
              { label: "Vehicles", href: "/vehicles" },
              { label: "Compare", href: "/vehicles/compare" },
              { label: "All Comparisons" },
            ]}
          />
        </div>

        <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-8 w-full flex-grow">
          {currentComparisons.length > 0 ? (
            <>
              <PopularVehicleComparisons comparisons={currentComparisons} title="All EV Comparisons" />

              {/* Server-side Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  {validPage > 1 ? (
                    <Link
                      href={`/vehicles/comparisons?page=${validPage - 1}`}
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
                      href={`/vehicles/comparisons?page=${validPage + 1}`}
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
              <p className="text-text-muted mb-6">
                No EV comparisons have been saved yet. Start comparing to build the list.
              </p>
              <Link
                href="/vehicles/compare"
                className="inline-flex px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
              >
                Compare EVs
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
