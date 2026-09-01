import type { Metadata } from "next";
import { getVehicles } from "@/app/lib/api";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import EVCard from "@/app/components/EVCard";
import Breadcrumb from "@/app/components/Breadcrumb";
import Pagination from "@/app/components/Pagination";
import Link from "next/link";
import { Car, GitCompareArrows } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const category = resolvedParams.category as string;
  let title = "Electric Vehicles Prices in Pakistan";
  let description = "Browse the latest Electric Vehicles prices and specifications in Pakistan.";
  
  if (category) {
    const formatted = category.charAt(0).toUpperCase() + category.slice(1);
    title = `${formatted}s Prices & Specifications in Pakistan`;
    description = `Browse the latest Electric ${formatted}s prices, specifications, and features in Pakistan.`;
  }

  const year = new Date().getFullYear();
  return {
    title: { absolute: `${title} ${year}` },
    description
  };
}

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  
  const queryParams = new URLSearchParams();
  if (resolvedParams.category) queryParams.set("category", resolvedParams.category as string);
  if (resolvedParams.page) queryParams.set("page", resolvedParams.page as string);
  if (resolvedParams.sort) queryParams.set("sort", resolvedParams.sort as string);
  if (resolvedParams.limit) queryParams.set("limit", resolvedParams.limit as string);

  const paginatedData = await getVehicles(queryParams.toString());
  const vehicles = paginatedData?.data || [];

  return (
    <div className="min-h-screen bg-surface-white flex flex-col selection:bg-primary/20">
      <Navbar />
      
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 md:px-6 py-6 md:py-8">
        <Breadcrumb 
          items={[
            { label: resolvedParams.category ? `${resolvedParams.category}s` : "Vehicles" }
          ]} 
        />
        
        <div className="mt-4 md:mt-6 pb-4 border-b border-border-subtle flex flex-col md:flex-row gap-4 justify-between items-start md:items-end">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-text-main">
              {resolvedParams.category ? `${resolvedParams.category}s` : "All Electric Vehicles"}
            </h1>
            <p className="text-sm text-text-muted mt-2 max-w-2xl">
              Showing {vehicles.length} of {paginatedData?.total || 0} results
            </p>
          </div>
          <Link
            href="/vehicles/compare"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors shadow-sm shrink-0"
          >
            <GitCompareArrows className="w-4 h-4" />
            Compare EVs
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center bg-surface-container-low rounded-2xl border border-border-subtle">
              <div className="w-14 h-14 rounded-2xl bg-surface-container-high flex items-center justify-center text-text-muted mb-3">
                <Car className="w-7 h-7 text-text-muted" />
              </div>
              <h3 className="text-lg font-bold text-text-main mb-2">No vehicles found</h3>
              <p className="text-sm text-text-muted text-center max-w-md">
                Try removing some filters or check back later.
              </p>
            </div>
          ) : (
            vehicles.map((vehicle) => (
              <EVCard key={vehicle._id} vehicle={vehicle} variant="list" />
            ))
          )}
        </div>

        {paginatedData && paginatedData.totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <Pagination 
              currentPage={paginatedData.page} 
              totalPages={paginatedData.totalPages} 
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
