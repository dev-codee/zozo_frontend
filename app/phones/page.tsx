import { getPhones, getBrands } from "@/app/lib/api";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import PhoneCard from "@/app/components/PhoneCard";
import Breadcrumb from "@/app/components/Breadcrumb";
import SidebarFilter from "@/app/components/SidebarFilter";

export default async function PhonesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const maxPrice = resolvedParams.max_price as string;
  const minPrice = resolvedParams.min_price as string;
  const sort = resolvedParams.sort as string;
  const brand = resolvedParams.brand as string;

  // Build the query string
  let queryParts = [];
  if (minPrice) queryParts.push(`min_price=${minPrice}`);
  if (maxPrice) queryParts.push(`max_price=${maxPrice}`);
  if (sort) queryParts.push(`sort=${sort}`);
  if (brand) queryParts.push(`brand=${brand}`);
  
  const query = queryParts.length > 0 ? queryParts.join("&") : undefined;
  
  const [phones, brands] = await Promise.all([
    getPhones(query),
    getBrands()
  ]);

  let title = "All Phones";
  if (brand && !brand.includes(",")) {
    const selectedBrand = brands.find((b) => b.slug === brand);
    if (selectedBrand) title = `${selectedBrand.name} Phones`;
  } else if (brand) {
    title = "Filtered Phones";
  } else if (maxPrice) {
    title = `Phones Under Rs. ${Number(maxPrice).toLocaleString()}`;
  } else if (sort === "latest") {
    title = "Latest Phones";
  } else if (sort === "trending") {
    title = "Trending Phones";
  }

  return (
    <>
      <Navbar />
      <main className="w-full max-w-[1280px] mx-auto px-4 md:px-6 py-8 flex flex-col md:flex-row gap-8 bg-surface min-h-[60vh]">
        <SidebarFilter brands={brands} />
        
        <section className="flex-1">
          <div className="mb-6 space-y-4">
            <Breadcrumb items={[{ label: title }]} />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="font-body-sm text-body-sm text-text-muted">
                Showing <span className="font-semibold text-text-main">{phones.length}</span> results
              </p>
              <div className="flex items-center gap-3">
                <label htmlFor="sort" className="font-label-sm text-label-sm text-text-muted whitespace-nowrap">Sort by:</label>
                <select id="sort" className="bg-surface-white border border-border-subtle rounded-md py-2 pl-3 pr-10 font-body-sm text-body-sm text-text-main focus:ring-1 focus:ring-primary-container focus:border-primary-container cursor-pointer">
                  <option value="latest">Latest</option>
                  <option value="trending">Trending</option>
                </select>
              </div>
            </div>
          </div>

          {phones.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {phones.map((phone) => (
                <PhoneCard key={phone._id} phone={phone} />
              ))}
            </div>
          ) : (
            <div className="bg-surface-white rounded-xl border border-border-subtle p-12 flex flex-col items-center justify-center text-center mt-6">
              <span className="material-symbols-outlined text-[64px] text-outline mb-4">
                sentiment_dissatisfied
              </span>
              <h2 className="font-headline-md text-xl font-bold text-text-main mb-2">
                No Phones Found
              </h2>
              <p className="text-text-muted max-w-md mx-auto">
                We couldn't find any phones matching your filters. Try adjusting them or clearing the selections.
              </p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
