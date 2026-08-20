import type { Metadata } from "next";
import { getPhones, getBrands } from "@/app/lib/api";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import PhoneCard from "@/app/components/PhoneCard";
import Breadcrumb from "@/app/components/Breadcrumb";
import SidebarFilter from "@/app/components/SidebarFilter";
import Pagination from "@/app/components/Pagination";
import { generateCollectionPageSchema, generateBreadcrumbSchema } from "@/app/lib/schema";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const brand = resolvedParams.brand as string;
  const maxPrice = resolvedParams.max_price as string;
  const category = resolvedParams.category as string;
  const forLabel = resolvedParams.for as string;

  let title = "Mobile Phone Prices in Pakistan — Full Phone List";
  let description = "Browse and filter latest mobile phone prices, specifications, and features in Pakistan. Compare specs across top brands.";

  if (forLabel) {
    title = `${forLabel} — Price in Pakistan`;
    description = `Discover the best phones for ${forLabel} in Pakistan. Detailed specs, current prices, and comparison.`;
  } else if (brand && !brand.includes(",")) {
    const formattedBrand = brand.charAt(0).toUpperCase() + brand.slice(1);
    title = `${formattedBrand} Mobile Phone Prices in Pakistan`;
    description = `Compare all ${formattedBrand} mobile phone prices, full specifications, and latest deals in Pakistan on Zozo.`;
  } else if (maxPrice) {
    const formattedPrice = Number(maxPrice).toLocaleString();
    title = `Best Mobile Phones Under Rs. ${formattedPrice} in Pakistan`;
    description = `Find the best smartphones priced under Rs. ${formattedPrice} in Pakistan. Compare camera, battery, RAM, and performance.`;
  } else if (category) {
    title = `Best ${category.charAt(0).toUpperCase() + category.slice(1)} Mobile Phones in Pakistan`;
  }

  // Canonical resolution.
  // The pretty brand landing URL `/{brand}-phone-price-pakistan` is internally
  // rewritten to `/phones?brand={brand}`. When brand is the *only* active filter
  // we must canonicalize back to the pretty URL (which is what lives in the
  // sitemap), otherwise Google reports the branded page as "Alternate page with
  // proper canonical tag" and indexes the ugly query URL instead — or nothing.
  let canonicalUrl: string;
  const isSoleBrand = !!brand && !brand.includes(",") && !maxPrice && !category && !forLabel;

  if (isSoleBrand) {
    canonicalUrl = `https://zozo.pk/${brand}-phone-price-pakistan`;
  } else {
    const queryParams = new URLSearchParams();
    if (brand) queryParams.set("brand", brand);
    if (maxPrice) queryParams.set("max_price", maxPrice);
    if (category) queryParams.set("category", category);
    const queryString = queryParams.toString();
    canonicalUrl = `https://zozo.pk/phones${queryString ? `?${queryString}` : ""}`;
  }

  // Append the auto-updating current year (stripping any pre-existing year so it
  // never doubles or goes stale) and expose it as an `absolute` title so the
  // "%s | Zozo" template from the root layout is not applied to listing pages.
  const year = new Date().getFullYear();
  const finalTitle = `${title.replace(/\s*\b20\d{2}\b\s*$/, "").trim()} ${year}`;

  return {
    title: { absolute: finalTitle },
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: finalTitle,
      description,
      url: canonicalUrl,
    },
  };
}

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
  const ram = resolvedParams.ram as string;
  const processor = resolvedParams.processor as string;
  const display = resolvedParams.display as string;
  const camera = resolvedParams.camera as string;
  const network = resolvedParams.network as string;
  const battery = resolvedParams.battery as string;
  const video = resolvedParams.video as string;
  const storage = resolvedParams.storage as string;
  const refreshRate = resolvedParams.refresh_rate as string;
  const page = resolvedParams.page as string;
  const limit = resolvedParams.limit as string;
  const category = resolvedParams.category as string;
  const status = resolvedParams.status as string;
  const forLabel = resolvedParams.for as string;

  // Build the query string
  let queryParts = [];
  if (page) queryParts.push(`page=${page}`);
  if (minPrice) queryParts.push(`min_price=${minPrice}`);
  if (maxPrice) queryParts.push(`max_price=${maxPrice}`);
  if (sort) queryParts.push(`sort=${sort}`);
  if (brand) queryParts.push(`brand=${brand}`);
  if (ram) queryParts.push(`ram=${ram}`);
  if (processor) queryParts.push(`processor=${processor}`);
  if (display) queryParts.push(`display=${display}`);
  if (camera) queryParts.push(`camera=${camera}`);
  if (network) queryParts.push(`network=${network}`);
  if (battery) queryParts.push(`battery=${battery}`);
  if (video) queryParts.push(`video=${video}`);
  if (storage) queryParts.push(`storage=${storage}`);
  if (refreshRate) queryParts.push(`refresh_rate=${refreshRate}`);
  if (limit) queryParts.push(`limit=${limit}`);
  if (category) queryParts.push(`category=${category}`);
  if (status) queryParts.push(`status=${status}`);

  const query = queryParts.length > 0 ? queryParts.join("&") : undefined;

  const [paginatedData, brands] = await Promise.all([
    getPhones(query),
    getBrands()
  ]);

  const { phones, pagination } = paginatedData;

  let title = "All Phones";
  if (forLabel) {
    title = forLabel;
  } else if (brand && !brand.includes(",")) {
    const selectedBrand = brands.find((b) => b.slug === brand);
    if (selectedBrand) title = `${selectedBrand.name.toUpperCase()} Phones`;
  } else if (brand) {
    title = "Filtered Phones";
  } else if (category) {
    title = `Best Phones for ${category.charAt(0).toUpperCase() + category.slice(1)}`;
  } else if (status === "upcoming") {
    title = "Upcoming Phones";
  } else if (sort === "price_asc") {
    title = "Best Phones By Price";
  } else if (maxPrice) {
    title = `Phones Under Rs. ${Number(maxPrice).toLocaleString()}`;
  } else if (sort === "latest") {
    title = "Latest Phones";
  } else if (sort === "trending") {
    title = limit === "10" ? "Top 10 Trending Phones" : "Trending Phones";
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateCollectionPageSchema(title, `Explore ${title} on Zozo`, `/phones`)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbSchema([{ label: title }])),
        }}
      />
      <Navbar />
      <main className="w-full max-w-[1280px] mx-auto px-4 md:px-6 py-8 flex flex-col md:flex-row gap-8 bg-surface min-h-[60vh]">
        <SidebarFilter brands={brands} />

        <section className="flex-1">
          <div className="mb-6 space-y-4">
            <Breadcrumb items={[{ label: title }]} />

            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-text-main tracking-tight mb-1">
                {title}
              </h1>
              <p className="text-sm text-text-muted">
                Compare prices, features, and full specifications across top online retailers in Pakistan.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="font-body-sm text-body-sm text-text-muted">
                Showing <span className="font-semibold text-text-main">{phones.length}</span> of <span className="font-semibold text-text-main">{pagination.total}</span> results
              </p>
              <div className="flex items-center gap-3">
                <label htmlFor="sort" className="font-label-sm text-label-sm text-text-muted whitespace-nowrap">Sort by:</label>
                <select id="sort" className="bg-surface-white border border-border-subtle rounded-md py-2 pl-3 pr-10 font-body-sm text-body-sm text-text-main focus:ring-1 focus:ring-primary-container focus:border-primary-container cursor-pointer">
                  <option value="latest">Latest</option>
                  <option value="trending">Trending</option>
                  <option value="price_asc">Price: Low to High</option>
                </select>
              </div>
            </div>
          </div>

          {phones.length > 0 ? (
            <div className="flex flex-col gap-6">
              {phones.map((phone) => (
                <PhoneCard key={phone._id} phone={phone} />
              ))}

              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
              />
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
