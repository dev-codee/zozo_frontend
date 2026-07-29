import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { getPhoneBySlug, getPhones, Phone } from "@/app/lib/api";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Breadcrumb from "@/app/components/Breadcrumb";
import PhoneGallery from "@/app/components/PhoneGallery";
import PhoneSpecs from "@/app/components/PhoneSpecs";
import PhoneDescriptionClient from "@/app/components/PhoneDescriptionClient";
import UserFeedbackWidget from "@/app/components/UserFeedbackWidget";
import ReviewSection from "@/app/components/ReviewSection";
import AdSlot from "@/app/components/AdSlot";
function getTagColorClass(tag: string) {
  const hash = Array.from(tag).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorThemes = [
    { bg: "bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-500/20" },
    { bg: "bg-blue-500/10", text: "text-blue-700 dark:text-blue-400", border: "border-blue-500/20" },
    { bg: "bg-amber-500/10", text: "text-amber-700 dark:text-amber-400", border: "border-amber-500/20" },
    { bg: "bg-rose-500/10", text: "text-rose-700 dark:text-rose-400", border: "border-rose-500/20" },
    { bg: "bg-purple-500/10", text: "text-purple-700 dark:text-purple-400", border: "border-purple-500/20" },
    { bg: "bg-cyan-500/10", text: "text-cyan-700 dark:text-cyan-400", border: "border-cyan-500/20" },
    { bg: "bg-indigo-500/10", text: "text-indigo-700 dark:text-indigo-400", border: "border-indigo-500/20" },
    { bg: "bg-orange-500/10", text: "text-orange-700 dark:text-orange-400", border: "border-orange-500/20" },
    { bg: "bg-teal-500/10", text: "text-teal-700 dark:text-teal-400", border: "border-teal-500/20" }
  ];
  return colorThemes[hash % colorThemes.length];
}

function getYouTubeEmbedId(url: string) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const phone = await getPhoneBySlug(resolvedParams.slug);

  if (!phone) {
    return {
      title: "Phone Not Found | Zozo",
      description: "The requested phone could not be found.",
    };
  }

  return {
    title: phone.seo?.meta_title || `${phone.name} Price in Pakistan, Specs & Reviews`,
    description: phone.seo?.meta_description || `Find the best price for ${phone.name} in Pakistan. Read full specifications, features, and user reviews on Zozo.`,
  };
}

export default async function PhoneDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const phone = await getPhoneBySlug(resolvedParams.slug);

  if (!phone) {
    notFound();
  }

  // Derived values
  const validPrices = (phone.prices || []).map((p) => p.price_pkr).filter(p => typeof p === 'number' && p > 0);
  const lowestPrice = phone.price_pkr || (validPrices.length ? Math.min(...validPrices) : null);
  const rating = phone.rating?.average;
  const reviewCount = phone.rating?.count || 0;
  const hasAffiliateUrls = phone.prices?.some((p) => !!p.product_url);

  // Fetch competitor phones
  let competitorPhones: Phone[] = [];
  try {
    if (lowestPrice) {
      const minPrice = lowestPrice - 3000;
      const maxPrice = lowestPrice + 3000;
      const allMatching = await getPhones(`min_price=${minPrice}&max_price=${maxPrice}`);
      competitorPhones = allMatching.phones
        .filter((p) => p.slug !== phone.slug)
        .slice(0, 10);
    } else {
      const sameBrand = await getPhones(`brand=${phone.brand_slug}`);
      competitorPhones = sameBrand.phones
        .filter((p) => p.slug !== phone.slug)
        .slice(0, 10);
    }
  } catch (error) {
    console.error("Failed to fetch competitors:", error);
  }

  // Fetch brand phones for the sidebar list
  let brandPhones: Phone[] = [];
  try {
    if (!lowestPrice) {
      brandPhones = competitorPhones;
    } else {
      const sameBrand = await getPhones(`brand=${phone.brand_slug}`);
      brandPhones = sameBrand.phones
        .filter((p) => p.slug !== phone.slug)
        .slice(0, 10);
    }
  } catch (error) {
    console.error("Failed to fetch brand phones:", error);
  }

  const releaseDateStr = phone.release_date && !isNaN(Date.parse(phone.release_date))
    ? new Date(phone.release_date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : null;

  // Format specs for the row
  const specs = phone.specs || {};

  // RAM processing
  const ramOptions = specs.performance?.ram_options_gb;
  const ramDisplay = ramOptions?.length
    ? `${Math.max(...ramOptions)}GB`
    : "N/A";

  // Storage processing
  const storageOptions = specs.performance?.storage_options_gb;
  const storageDisplay = storageOptions?.length
    ? `${Math.max(...storageOptions)}GB`
    : "N/A";

  // Battery processing
  const batteryCap = specs.battery?.capacity_mah;
  const batteryDisplay = batteryCap ? `${batteryCap}mAh` : "N/A";

  // Camera processing (simplified, taking first rear camera if available or a summary)
  const cameraDisplay = specs.camera?.rear_summary || "N/A";

  // Display processing
  const displaySize = specs.display?.size_inches;
  const displayType = specs.display?.type;
  // If type contains size info (like "6000 mAh" which is wrong in the DB for display), we just use size
  const displayString = displaySize ? `${displaySize}"` : "N/A";

  // Chipset processing
  const chipsetFull = specs.performance?.chipset;
  // Try to extract a shorter name, e.g., "Snapdragon 6 Gen 3" from "Qualcomm SM6475-AB Snapdragon 6 Gen 3 (4 nm)"
  let chipsetDisplay = chipsetFull || "N/A";
  if (chipsetFull?.includes("Snapdragon")) {
    const match = chipsetFull.match(/(Snapdragon[^(\n]+)/);
    if (match) chipsetDisplay = match[1].trim();
  } else if (chipsetFull?.includes("Apple")) {
    const match = chipsetFull.match(/(Apple[^(\n]+)/);
    if (match) chipsetDisplay = match[1].trim();
  }

  // Network processing
  const network = specs.connectivity?.network || "";
  let networkDisplay = "N/A";
  if (network.includes("5G")) {
    networkDisplay = "5G Supported";
  } else if (network.includes("4G") || network.includes("LTE")) {
    networkDisplay = "4G Supported";
  } else if (network) {
    networkDisplay = "Network Supported";
  }

  // OS processing
  const osDisplay = specs.os || "N/A";


  return (
    <>
      <Navbar />
      <main className="w-full max-w-[1280px] mx-auto px-4 md:px-6 py-8 flex flex-col gap-[15px] bg-surface">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: phone.brand_slug.replace("-", " "), href: `/${phone.brand_slug}-phone-price-pakistan` },
            { label: phone.name },
          ]}
        />

        {/* Hero Section Container */}
        <div className="bg-white border border-border-subtle rounded-xl p-6 md:p-8 shadow-sm">
          {/* Hero Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Gallery */}
            <PhoneGallery images={phone.images} altText={`${phone.name.replace(/\s+/g, '-')}-Price-in-Pakistan-ZOZO`} />

            {/* Product Info */}
            <div className="flex flex-col gap-3">
              <div>
                <h1 className="font-headline-lg text-2xl md:text-3xl lg:text-4xl text-text-main mb-1.5 font-bold tracking-tight">
                  {phone.name}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mb-0">
                  <span className="inline-flex items-center gap-1 bg-surface-container-low text-text-muted font-label-sm text-xs px-3 py-1 rounded-full capitalize border border-border-subtle">
                    {phone.brand_slug.replace("-", " ")}
                  </span>
                  {releaseDateStr && (
                    <span className="inline-flex items-center gap-1 bg-surface-container-low text-text-muted font-label-sm text-xs px-3 py-1 rounded-full border border-border-subtle">
                      Released: {releaseDateStr}
                    </span>
                  )}
                  {phone.tags?.map((tag) => {
                    const colors = getTagColorClass(tag);
                    return (
                      <span
                        key={tag}
                        className={`inline-flex items-center gap-1 ${colors.bg} ${colors.text} rounded-full px-3 py-1 text-xs font-semibold border ${colors.border}`}
                      >
                        {tag}
                      </span>
                    );
                  })}
                </div>

                {/* Rating */}
                {rating && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex items-center text-yellow-500">
                      <span
                        className="material-symbols-outlined text-[20px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                      <span className="font-label-md text-sm text-text-main ml-1 font-semibold">
                        {rating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-text-muted font-body-sm text-sm">
                      ({reviewCount} reviews)
                    </span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="font-display-lg text-2xl md:text-3xl font-bold text-price-green tracking-tight">
                  {lowestPrice ? `Rs. ${lowestPrice.toLocaleString()}` : "Price TBA"}
                </span>
              </div>

              {phone.pta_tax && (phone.pta_tax.passport_pkr || phone.pta_tax.cnic_pkr) && (
                <div className="p-4 bg-surface-container-low/50 border border-border-subtle rounded-xl flex flex-col gap-2">
                  <h3 className="text-xs font-bold text-text-main flex items-center gap-1.5 uppercase tracking-wider">
                    <span className="material-symbols-outlined text-primary text-[18px]">gavel</span>
                    PTA Tax Estimate
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mt-1">
                    {phone.pta_tax.passport_pkr ? (
                      <div>
                        <span className="text-[10px] text-text-muted block">On Passport</span>
                        <span className="text-sm font-bold text-text-main mt-0.5">Rs. {phone.pta_tax.passport_pkr.toLocaleString()}</span>
                      </div>
                    ) : null}
                    {phone.pta_tax.cnic_pkr ? (
                      <div>
                        <span className="text-[10px] text-text-muted block">On CNIC</span>
                        <span className="text-sm font-bold text-text-main mt-0.5">Rs. {phone.pta_tax.cnic_pkr.toLocaleString()}</span>
                      </div>
                    ) : null}
                  </div>
                  {phone.pta_tax.source_note && (
                    <p className="text-[10px] text-text-muted italic border-t border-border-subtle/50 pt-1.5 mt-1">{phone.pta_tax.source_note}</p>
                  )}
                </div>
              )}

              {/* Key Specs */}
              <div className="bg-white p-4 sm:p-5 rounded-xl mt-2">
                <h2 className="text-base sm:text-lg font-bold text-text-main flex items-center gap-2 mb-4">
                  <span className="w-1 h-5 sm:h-6 bg-primary rounded-full"></span>
                  Top Features of {phone.name}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {/* Box 1: RAM */}
                  <div className="flex items-center gap-2 p-1.5 sm:p-2 rounded-sm border border-border-subtle bg-surface-white hover:border-primary/50 transition-colors">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-sm bg-blue-50 text-primary flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[14px] sm:text-[18px]">memory</span>
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[9px] sm:text-[10px] font-medium text-text-muted uppercase tracking-wider mb-0.5">RAM</span>
                      <span className="text-[11px] sm:text-xs font-medium text-text-main leading-tight line-clamp-2">{ramDisplay}</span>
                    </div>
                  </div>

                  {/* Box 2: STORAGE */}
                  <div className="flex items-center gap-2 p-1.5 sm:p-2 rounded-sm border border-border-subtle bg-surface-white hover:border-primary/50 transition-colors">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-sm bg-blue-50 text-primary flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[14px] sm:text-[18px]">storage</span>
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[9px] sm:text-[10px] font-medium text-text-muted uppercase tracking-wider mb-0.5">Storage</span>
                      <span className="text-[11px] sm:text-xs font-medium text-text-main leading-tight line-clamp-2">{storageDisplay}</span>
                    </div>
                  </div>

                  {/* Box 3: NETWORK */}
                  <div className="flex items-center gap-2 p-1.5 sm:p-2 rounded-sm border border-border-subtle bg-surface-white hover:border-primary/50 transition-colors">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-sm bg-blue-50 text-primary flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[14px] sm:text-[18px]">signal_cellular_alt</span>
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[9px] sm:text-[10px] font-medium text-text-muted uppercase tracking-wider mb-0.5">Network</span>
                      <span className="text-[11px] sm:text-xs font-medium text-text-main leading-tight line-clamp-2">{networkDisplay}</span>
                    </div>
                  </div>

                  {/* Box 4: BATTERY */}
                  <div className="flex items-center gap-2 p-1.5 sm:p-2 rounded-sm border border-border-subtle bg-surface-white hover:border-primary/50 transition-colors">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-sm bg-blue-50 text-primary flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[14px] sm:text-[18px]">battery_charging_full</span>
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[9px] sm:text-[10px] font-medium text-text-muted uppercase tracking-wider mb-0.5">Battery</span>
                      <span className="text-[11px] sm:text-xs font-medium text-text-main leading-tight line-clamp-2">{batteryDisplay}</span>
                    </div>
                  </div>

                  {/* Box 8: OS */}
                  <div className="flex items-center gap-2 p-1.5 sm:p-2 rounded-sm border border-border-subtle bg-surface-white hover:border-primary/50 transition-colors">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-sm bg-blue-50 text-primary flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[14px] sm:text-[18px]">widgets</span>
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[9px] sm:text-[10px] font-medium text-text-muted uppercase tracking-wider mb-0.5">OS</span>
                      <span className="text-[11px] sm:text-xs font-medium text-text-main leading-tight line-clamp-2">{osDisplay}</span>
                    </div>
                  </div>

                  {/* Box 6: DISPLAY */}
                  <div className="flex items-center gap-2 p-1.5 sm:p-2 rounded-sm border border-border-subtle bg-surface-white hover:border-primary/50 transition-colors">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-sm bg-blue-50 text-primary flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[14px] sm:text-[18px]">smartphone</span>
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[9px] sm:text-[10px] font-medium text-text-muted uppercase tracking-wider mb-0.5">Display</span>
                      <span className="text-[11px] sm:text-xs font-medium text-text-main leading-tight line-clamp-2">{displayString}</span>
                    </div>
                  </div>

                  {/* Box 5: CAMERA */}
                  <div className="flex items-center gap-2 p-1.5 sm:p-2 rounded-sm border border-border-subtle bg-surface-white hover:border-primary/50 transition-colors">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-sm bg-blue-50 text-primary flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[14px] sm:text-[18px]">photo_camera</span>
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[9px] sm:text-[10px] font-medium text-text-muted uppercase tracking-wider mb-0.5">Camera</span>
                      <span className="text-[11px] sm:text-xs font-medium text-text-main leading-tight line-clamp-2">{cameraDisplay}</span>
                    </div>
                  </div>

                  {/* Box 7: CHIPSET */}
                  <div className="flex items-center gap-2 p-1.5 sm:p-2 rounded-sm border border-border-subtle bg-surface-white hover:border-primary/50 transition-colors">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-sm bg-blue-50 text-primary flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[14px] sm:text-[18px]">developer_board</span>
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[9px] sm:text-[10px] font-medium text-text-muted uppercase tracking-wider mb-0.5">Chipset</span>
                      <span className="text-[11px] sm:text-xs font-medium text-text-main leading-tight line-clamp-2">{chipsetDisplay}</span>
                    </div>
                  </div>

                </div>

                {/* Actions */}
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                  {/* Action 1: Compare */}
                  <Link
                    href={`/compare?phone=${phone.slug}`}
                    className="flex items-center justify-center gap-1.5 py-1 px-3 sm:py-1.5 sm:px-4 rounded-sm border border-border-subtle bg-surface-white hover:bg-surface-container-low hover:border-primary font-medium text-[10px] sm:text-[11px] text-text-main transition-colors"
                  >
                    <span className="material-symbols-outlined text-[13px] sm:text-[14px]">
                      compare_arrows
                    </span>
                    Compare
                  </Link>

                  {/* Action 2: Price Alert */}
                  <button className="flex items-center justify-center gap-1.5 py-1 px-3 sm:py-1.5 sm:px-4 rounded-sm border border-border-subtle bg-surface-white hover:bg-surface-container-low hover:border-primary font-medium text-[10px] sm:text-[11px] text-text-main transition-colors">
                    <span className="material-symbols-outlined text-[13px] sm:text-[14px]">
                      notifications
                    </span>
                    Price Alert
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Combined Price Comparison & Specs Grid Container with equal vertical gap */}
        <div className="flex flex-col gap-[15px]">
          {/* Price Comparison Table */}
          {hasAffiliateUrls && (
            <section className="bg-surface-white border border-border-subtle rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 md:px-6 border-b border-border-subtle bg-surface-container-low/30">
                <h2 className="font-headline-md text-lg font-bold text-text-main">
                  Price Comparison
                </h2>
              </div>

              <div className="divide-y divide-border-subtle">
                {phone.prices && phone.prices.length > 0 ? (
                  phone.prices.map((priceItem, index) => (
                    <div
                      key={index}
                      className="p-3 md:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-container-lowest transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-surface-container-low border border-border-subtle rounded-lg flex items-center justify-center font-bold text-primary text-base uppercase shadow-sm flex-shrink-0">
                          {priceItem.retailer_name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-label-md text-sm font-semibold text-text-main">
                            {priceItem.retailer_name}
                          </div>
                          <div className="font-body-sm text-xs text-price-green font-medium flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-price-green"></span>
                            {priceItem.stock_status || "In Stock"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto mt-1 md:mt-0 pt-3 md:pt-0 border-t border-border-subtle md:border-0">
                        <div className="font-headline-md text-lg font-bold text-text-main">
                          Rs. {priceItem.price_pkr.toLocaleString()}
                        </div>
                        {priceItem.product_url ? (
                          <a
                            href={priceItem.product_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-primary hover:bg-on-primary-fixed-variant text-white font-label-md text-xs px-5 h-9 transition-all shadow-md hover:shadow-lg rounded-lg font-semibold flex items-center justify-center cursor-pointer"
                          >
                            Buy Now
                          </a>
                        ) : (
                          <button
                            className="bg-surface-container-low text-text-muted font-label-md text-xs px-5 h-9 rounded-lg font-semibold flex items-center justify-center cursor-not-allowed border border-border-subtle"
                            disabled
                          >
                            Unavailable
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <span className="material-symbols-outlined text-4xl text-outline mb-2">
                      storefront
                    </span>
                    <p className="text-text-muted font-medium">No prices available for this phone yet.</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Specifications and Competitors Section with equal gap */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-[15px] items-start">
            <div className="lg:col-span-2">
              {/* Full Specifications Table */}
              <PhoneSpecs specs={phone.specs} />
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white border border-border-subtle rounded-xl p-4 shadow-sm">
                <h3 className="font-headline-sm text-sm font-bold text-text-main mb-4 flex items-center gap-1">
                  <span className="material-symbols-outlined text-primary text-lg">compare_arrows</span>
                  Competitors for {phone.name}
                </h3>

                {competitorPhones.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {competitorPhones.map((comp) => {
                      const compLowestPrice = comp.prices?.length
                        ? Math.min(...comp.prices.map((p) => p.price_pkr))
                        : null;
                      const primaryImage = comp.images?.find((img) => img.is_primary) || comp.images?.[0];

                      return (
                        <Link
                          key={comp._id}
                          href={`/phones/${comp.slug}`}
                          className="flex flex-col rounded-lg border border-border-subtle hover:border-primary hover:shadow-sm transition-all bg-white overflow-hidden group"
                        >
                          <div className="relative aspect-[4/5] bg-surface-container-low flex items-center justify-center p-3">
                            <div className="absolute top-2 left-2 bg-[#8BC34A] text-white text-[10px] font-bold px-1.5 py-1 rounded flex flex-col items-center shadow-sm z-10 leading-tight">
                              <span>85%</span>
                              <span className="text-[7px] font-medium opacity-90 text-center uppercase tracking-wider">Spec<br />Score</span>
                            </div>
                            {primaryImage ? (
                              <img
                                src={primaryImage.url}
                                alt={comp.name}
                                className="object-contain w-full h-full mix-blend-darken group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <span className="material-symbols-outlined text-text-muted text-3xl">smartphone</span>
                            )}
                          </div>
                          <div className="flex flex-col p-3 bg-white">
                            <h4 className="font-semibold text-xs text-text-main group-hover:text-primary transition-colors line-clamp-2 min-h-[32px]">
                              {comp.name}
                            </h4>
                            <span className="text-sm font-bold text-text-main mt-1">
                              {compLowestPrice ? `Rs. ${compLowestPrice.toLocaleString()}` : <span className="text-text-muted font-medium text-[10px]">(Upcoming)</span>}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-text-muted">No competitor devices found.</p>
                )}
              </div>

              {/* Other Brand Phones */}
              <div className="bg-white border border-border-subtle rounded-xl p-4 shadow-sm mt-6">
                <h3 className="font-headline-sm text-sm font-bold text-text-main mb-3">
                  Other {phone.brand_slug.charAt(0).toUpperCase() + phone.brand_slug.slice(1).replace("-", " ")} Mobile Prices in Pakistan
                </h3>
                <ul className="flex flex-col gap-2">
                  {brandPhones.map(bp => (
                    <li key={bp._id}>
                      <Link href={`/phones/${bp.slug}`} className="text-sm text-primary hover:underline line-clamp-1">
                        {bp.name} Price in Pakistan
                      </Link>
                    </li>
                  ))}
                  {brandPhones.length === 0 && (
                    <li className="text-xs text-text-muted">No other phones found.</li>
                  )}
                </ul>
              </div>

              {/* Best Phones by Price */}
              <div className="bg-white border border-border-subtle rounded-xl p-4 shadow-sm mt-6">
                <h3 className="font-headline-sm text-sm font-bold text-red-600 mb-3">
                  Best Phones List with Price
                </h3>
                <ul className="flex flex-col gap-2">
                  {[10000, 15000, 20000, 30000, 40000, 50000, 80000, 100000].map(price => (
                    <li key={price}>
                      <Link href={`/phones?max_price=${price}`} className="text-sm text-primary hover:underline">
                        Mobile phone price under {price.toLocaleString()}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sidebar Ad Slot */}
              <div className="mt-6">
                <AdSlot placement="SIDEBAR" layout="col" />
              </div>
            </div>
          </div>
        </div>

        {/* Video Review Section */}
        {phone.video_url && (
          <section className="bg-white border border-border-subtle rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border-subtle bg-surface-container-low/30 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-600 text-2xl">smart_display</span>
              <h2 className="font-headline-md text-xl font-bold text-text-main">
                Video Review & Hands-on
              </h2>
            </div>
            <div className="p-6 flex justify-center">
              {getYouTubeEmbedId(phone.video_url) ? (
                <div className="w-full max-w-3xl aspect-video rounded-lg overflow-hidden border border-border-subtle shadow-sm">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${getYouTubeEmbedId(phone.video_url)}`}
                    title={`${phone.name} Video Review`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <a
                  href={phone.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline font-semibold"
                >
                  <span className="material-symbols-outlined">open_in_new</span>
                  Watch Video on YouTube
                </a>
              )}
            </div>
          </section>
        )}

        {/* User Feedback Widget */}
        <UserFeedbackWidget phoneId={phone._id} phoneName={phone.name} />

        {/* Product Description */}
        <PhoneDescriptionClient slug={phone.slug} initialDescription={phone.description} phoneName={phone.name} />

        {/* Product Area Ad Slot */}
        <div className="mt-2 mb-4">
          <AdSlot placement="PRODUCT_AREA" layout="row" />
        </div>

        {/* User Reviews Section */}
        <ReviewSection phoneId={phone._id} />
      </main>
      <Footer />
    </>
  );
}
