import { searchPhones } from "@/app/lib/api";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import PhoneCard from "@/app/components/PhoneCard";
import Breadcrumb from "@/app/components/Breadcrumb";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q as string;
  
  const phones = q ? await searchPhones(q) : [];

  return (
    <>
      <Navbar />
      <main className="w-full max-w-[1280px] mx-auto px-4 md:px-6 py-8 flex flex-col gap-8 bg-surface min-h-[60vh]">
        <Breadcrumb items={[{ label: "Search Results" }]} />
        
        <div className="flex items-center justify-between">
          <h1 className="font-headline-lg text-3xl font-bold text-text-main">
            Search Results for "{q}"
          </h1>
          <span className="text-text-muted font-body-sm text-sm">
            {phones.length} results
          </span>
        </div>

        {phones.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {phones.map((phone) => (
              <PhoneCard key={phone._id} phone={phone} />
            ))}
          </div>
        ) : (
          <div className="bg-surface-white rounded-xl border border-border-subtle p-12 flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-[64px] text-outline mb-4">
              search_off
            </span>
            <h2 className="font-headline-md text-xl font-bold text-text-main mb-2">
              No Results Found
            </h2>
            <p className="text-text-muted max-w-md mx-auto">
              We couldn't find any phones matching "{q}". Try searching for a different brand or model.
            </p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
