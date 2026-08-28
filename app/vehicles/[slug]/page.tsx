import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getVehicleBySlug, getRelatedVehicles, type Vehicle } from "@/app/lib/api";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Breadcrumb from "@/app/components/Breadcrumb";
import EVGallery from "@/app/components/EVGallery";
import EVSpecs from "@/app/components/EVSpecs";
import EVDescriptionClient from "@/app/components/EVDescriptionClient";
import AdSlot from "@/app/components/AdSlot";
import AppIcon from "@/app/components/AppIcon";
import { getBrandRegion } from "@/app/lib/brandRegion";
import {
  generateVehicleSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateVideoSchema,
  generateWebPageSchema,
} from "@/app/lib/schema";

export const revalidate = 3600; // Cache for 1 hour

function getYouTubeEmbedId(url: string) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

function getBudgetLinks(category?: string) {
  const cat = category || "Car";

  if (cat === "Scooter" || cat === "Bike") {
    const catTitle = cat === "Bike" ? "Bikes" : "Scooters";
    return {
      title: `Electric ${catTitle} by Budget`,
      items: [
        { label: `Under Rs. 1.5 Lakh`, price: 150000 },
        { label: `Under Rs. 2.5 Lakh`, price: 250000 },
        { label: `Under Rs. 4 Lakh`, price: 400000 },
        { label: `Under Rs. 6 Lakh`, price: 600000 },
        { label: `Under Rs. 10 Lakh`, price: 1000000 },
      ],
      queryParam: `category=${cat}`,
    };
  }

  if (cat === "Cycle") {
    return {
      title: `Electric Cycles by Budget`,
      items: [
        { label: `Under Rs. 35,000`, price: 35000 },
        { label: `Under Rs. 50,000`, price: 50000 },
        { label: `Under Rs. 75,000`, price: 75000 },
        { label: `Under Rs. 1 Lakh`, price: 100000 },
      ],
      queryParam: `category=Cycle`,
    };
  }

  // Cars (max 3 Crore)
  return {
    title: `Electric Cars by Budget`,
    items: [
      { label: `Under Rs. 50 Lakh`, price: 5000000 },
      { label: `Under Rs. 80 Lakh`, price: 8000000 },
      { label: `Under Rs. 1 Crore`, price: 10000000 },
      { label: `Under Rs. 1.5 Crore`, price: 15000000 },
      { label: `Under Rs. 2 Crore`, price: 20000000 },
      { label: `Under Rs. 3 Crore`, price: 30000000 },
    ],
    queryParam: `category=Car`,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const data = await getVehicleBySlug(resolvedParams.slug);
  const vehicle = data?.vehicle;

  if (!vehicle) {
    return {
      title: "Vehicle Not Found | Zozo",
      description: "The requested electric vehicle could not be found.",
    };
  }

  const primaryImage = vehicle.images?.find((img) => img.url)?.url;
  const canonicalUrl = `https://zozo.pk/vehicles/${vehicle.slug}`;
  const year = new Date().getFullYear();

  const baseTitle =
    vehicle.seo?.meta_title ||
    vehicle.seo?.ai_seo_title ||
    `${vehicle.name} Price in Pakistan & Full Specs`;
  const title = `${baseTitle.replace(/\s*\b20\d{2}\b\s*$/, "").trim()} ${year}`;

  const description =
    vehicle.seo?.meta_description ||
    vehicle.seo?.ai_meta_description ||
    `Get complete details on ${vehicle.name} in Pakistan. Compare price, battery capacity, range, acceleration, charging speed, features, and full specifications on Zozo.`;

  return {
    title: { absolute: title },
    description,
    keywords: vehicle.seo?.ai_keywords || [
      `${vehicle.name} price in pakistan`,
      `${vehicle.brand_slug} electric car`,
      `${vehicle.name} specs`,
      `electric vehicles pakistan`,
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      images: primaryImage ? [{ url: primaryImage, alt: `${vehicle.name} Price in Pakistan` }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: primaryImage ? [primaryImage] : [],
    },
  };
}

export default async function EVDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const data = await getVehicleBySlug(resolvedParams.slug);

  if (!data || !data.vehicle) {
    notFound();
  }

  const { vehicle, variants = [] } = data;

  // Guard against missing fields
  vehicle.brand_slug = vehicle.brand_slug || "";
  vehicle.name = vehicle.name || "Electric Vehicle";

  // Related vehicles
  let relatedData: any = null;
  try {
    relatedData = await getRelatedVehicles(vehicle.slug);
  } catch (err) {
    console.error("Failed to fetch related vehicles:", err);
  }

  const competitors: Vehicle[] = relatedData?.by_category || [];
  const brandVehicles: Vehicle[] = relatedData?.by_brand || [];
  const priceCompetitors: Vehicle[] = relatedData?.by_price || [];

  // Derived price calculation
  const rawPriceStr = String(vehicle.price_pkr || "");
  const parsedPricePkr = Number(rawPriceStr.replace(/[^0-9.]/g, ""));
  const validPrices = (vehicle.prices || [])
    .map((p) => Number(p.price_pkr))
    .filter((p) => !isNaN(p) && p > 0);
  const lowestPrice =
    !isNaN(parsedPricePkr) && parsedPricePkr > 0
      ? parsedPricePkr
      : validPrices.length
      ? Math.min(...validPrices)
      : null;

  const hasAffiliateUrls = vehicle.prices?.some((p) => !!p.product_url);
  const rating = vehicle.rating?.average || vehicle.ratings?.overall;
  const reviewCount = vehicle.rating?.count || 0;

  const releaseDateStr =
    vehicle.release_date && !isNaN(Date.parse(vehicle.release_date))
      ? new Date(vehicle.release_date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;

  const specs = vehicle.specs || {};
  const pricing = vehicle.pricing || {};
  const brandRegion = getBrandRegion(vehicle.brand_slug, vehicle.made_in);

  // Build the 8-box highlights (ONLY values that exist)
  const highlights: { icon: string; label: string; value: string }[] = [];

  // 1. Battery
  const batteryCap = specs.battery?.capacity_usable_kwh || specs.battery?.capacity_gross_kwh;
  if (batteryCap) {
    highlights.push({
      icon: "battery_charging_full",
      label: "Battery",
      value: `${batteryCap} kWh${specs.battery?.capacity_usable_kwh ? " (Usable)" : ""}`,
    });
  }

  // 2. Range
  const rangeKm = specs.range_and_efficiency?.wltp_combined_km || specs.range_and_efficiency?.epa_combined_km || specs.range_and_efficiency?.cltc_range_km;
  if (rangeKm) {
    const rangeStandard = specs.range_and_efficiency?.wltp_combined_km ? "WLTP" : specs.range_and_efficiency?.epa_combined_km ? "EPA" : "CLTC";
    highlights.push({
      icon: "speed",
      label: "Range",
      value: `${rangeKm} km (${rangeStandard})`,
    });
  }

  // 3. Acceleration
  if (specs.powertrain?.acceleration_0_100_kmh) {
    highlights.push({
      icon: "shutter_speed",
      label: "0-100 km/h",
      value: `${specs.powertrain.acceleration_0_100_kmh} seconds`,
    });
  }

  // 4. Power
  if (specs.powertrain?.total_power_hp || specs.powertrain?.total_power_kw) {
    const powerStr = specs.powertrain?.total_power_hp
      ? `${specs.powertrain.total_power_hp} HP`
      : `${specs.powertrain?.total_power_kw} kW`;
    highlights.push({
      icon: "bolt",
      label: "Power",
      value: powerStr,
    });
  }

  // 5. Drive
  if (specs.powertrain?.drive_layout) {
    highlights.push({
      icon: "settings_ethernet",
      label: "Drivetrain",
      value: specs.powertrain.drive_layout,
    });
  }

  // 6. Fast Charging
  if (specs.charging?.dc_max_power_kw || specs.charging?.dc_charge_time_10_80_min) {
    const dcStr = specs.charging?.dc_max_power_kw
      ? `${specs.charging.dc_max_power_kw} kW DC`
      : `${specs.charging?.dc_charge_time_10_80_min} min (10-80%)`;
    highlights.push({
      icon: "offline_bolt",
      label: "Fast Charge",
      value: dcStr,
    });
  }

  // 7. Seats & Doors
  if (vehicle.seats || vehicle.doors) {
    const seatStr = [
      vehicle.seats ? `${vehicle.seats} Seats` : null,
      vehicle.doors ? `${vehicle.doors} Doors` : null,
    ]
      .filter(Boolean)
      .join(" • ");
    highlights.push({
      icon: "airline_seat_recline_extra",
      label: "Cabin",
      value: seatStr,
    });
  }

  // 8. Screen / Cockpit
  if (specs.cockpit_and_tech?.center_screen_inches) {
    highlights.push({
      icon: "tv",
      label: "Touchscreen",
      value: `${specs.cockpit_and_tech.center_screen_inches}" Display`,
    });
  }

  return (
    <>
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateVehicleSchema(vehicle)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateBreadcrumbSchema([
              { label: "Vehicles", href: "/vehicles" },
              {
                label: vehicle.ev_category ? `${vehicle.ev_category}s` : "Cars",
                href: `/vehicles?category=${vehicle.ev_category || "Car"}`,
              },
              { label: vehicle.name },
            ])
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateWebPageSchema(
              vehicle.seo?.meta_title || `${vehicle.name} Price in Pakistan, Specs & Features`,
              vehicle.seo?.meta_description ||
                `Check complete price, range, battery, performance and full specifications of ${vehicle.name} on ZOZO.`,
              `/vehicles/${vehicle.slug}`
            )
          ),
        }}
      />
      {vehicle.seo?.ai_faq && vehicle.seo.ai_faq.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateFAQSchema(vehicle.seo.ai_faq)),
          }}
        />
      )}
      {vehicle.video_url && generateVideoSchema(vehicle as any) && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateVideoSchema(vehicle as any)),
          }}
        />
      )}

      <div className="min-h-screen bg-surface-white flex flex-col selection:bg-primary/20">
        <Navbar />

        <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 md:px-6 py-6 md:py-8 flex flex-col gap-6">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: "Vehicles", href: "/vehicles" },
              {
                label: vehicle.ev_category ? `${vehicle.ev_category}s` : "Cars",
                href: `/vehicles?category=${vehicle.ev_category || "Car"}`,
              },
              { label: vehicle.name },
            ]}
          />

          {/* Hero Section Container */}
          <div className="bg-surface-white border border-border-subtle rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Left Column: Automotive Gallery */}
              <EVGallery
                images={vehicle.images}
                altText={`${vehicle.name} Price in Pakistan - ZOZO`}
                vehicleName={vehicle.name}
              />

              {/* Right Column: Title, Pricing & Highlights */}
              <div className="flex flex-col gap-5">
                <div>
                  <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-text-main leading-tight tracking-tight">
                    {vehicle.name}
                  </h1>

                  {/* Badges & Meta Row */}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {/* Brand */}
                    {vehicle.brand_slug && (
                      <Link
                        href={`/vehicles?brand=${vehicle.brand_slug}`}
                        className="inline-flex items-center gap-1 bg-blue-50 text-blue-900 font-bold text-xs px-2.5 py-1 rounded border border-blue-200 hover:bg-blue-100 uppercase tracking-wide transition-colors"
                      >
                        {vehicle.brand_slug.toUpperCase().replace("-", " ")}
                      </Link>
                    )}

                    {/* Category */}
                    {vehicle.ev_category && (
                      <Link
                        href={`/vehicles?category=${vehicle.ev_category}`}
                        className="inline-flex items-center gap-1 bg-blue-50 text-blue-900 font-bold text-xs px-2.5 py-1 rounded border border-blue-200 hover:bg-blue-100 uppercase tracking-wide transition-colors"
                      >
                        {vehicle.ev_category}
                      </Link>
                    )}

                    {/* Body Type (only if distinct from category) */}
                    {vehicle.body_type && vehicle.body_type.toLowerCase() !== vehicle.ev_category?.toLowerCase() && (
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-900 font-semibold text-xs px-2.5 py-1 rounded border border-blue-200">
                        {vehicle.body_type}
                      </span>
                    )}

                    {/* Vehicle / Powertrain Type (only if distinct) */}
                    {vehicle.vehicle_type &&
                      vehicle.vehicle_type.toLowerCase() !== vehicle.ev_category?.toLowerCase() &&
                      vehicle.vehicle_type.toLowerCase() !== vehicle.body_type?.toLowerCase() && (
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-900 font-bold text-xs px-2.5 py-1 rounded border border-blue-200 uppercase">
                        {vehicle.vehicle_type}
                      </span>
                    )}

                    {/* Availability Status */}
                    {vehicle.status && (
                      <span
                        className={`inline-flex items-center gap-1.5 font-bold text-xs px-2.5 py-1 rounded border ${
                          vehicle.status === "available"
                            ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                            : vehicle.status === "upcoming"
                            ? "bg-amber-50 text-amber-900 border-amber-300"
                            : "bg-blue-50 text-blue-900 border-blue-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            vehicle.status === "available"
                              ? "bg-emerald-600"
                              : vehicle.status === "upcoming"
                              ? "bg-amber-600"
                              : "bg-blue-600"
                          }`}
                        />
                        {vehicle.status === "available"
                          ? "Available in Pakistan"
                          : vehicle.status === "upcoming"
                          ? "Upcoming in Pakistan"
                          : vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                      </span>
                    )}

                    {/* Release Date */}
                    {releaseDateStr && (
                      <span className="inline-flex items-center gap-1 bg-blue-50/60 text-blue-900 font-medium text-xs px-2.5 py-1 rounded border border-blue-200">
                        Released: {releaseDateStr}
                      </span>
                    )}

                    {/* Region / Country of Origin */}
                    {brandRegion && (
                      <span className="inline-flex items-center gap-1.5 bg-surface-container-lowest text-text-main font-bold text-xs px-2.5 py-1 rounded border border-border-subtle">
                        <span className="text-base leading-none">{brandRegion.flag}</span>
                        {brandRegion.country}
                      </span>
                    )}
                  </div>

                  {/* Rating display */}
                  {rating && (
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex items-center text-yellow-500">
                        <AppIcon name="star" size={18} fill="#FF9800" className="text-yellow-500" />
                        <span className="text-sm font-bold text-text-main ml-1">
                          {typeof rating === "number" ? rating.toFixed(1) : rating}
                        </span>
                      </div>
                      {reviewCount > 0 && (
                        <span className="text-text-muted text-xs">
                          ({reviewCount} reviews)
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Pricing Box */}
                <div className="bg-surface-container-lowest/80 border border-border-subtle rounded-lg p-4 flex flex-col gap-1">
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-bold text-text-muted">Rs.</span>
                      <span className="text-3xl font-bold text-text-main tracking-tight">
                        {lowestPrice ? lowestPrice.toLocaleString() : "TBA"}
                      </span>
                    </div>
                    {lowestPrice ? (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                        Starting Price
                      </span>
                    ) : (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface-container-high text-text-muted">
                        Expected Price
                      </span>
                    )}
                  </div>

                  {/* Global base currencies */}
                  {(pricing.price_global_base_usd || pricing.price_global_base_eur || pricing.price_global_base_cny) && (
                    <div className="flex flex-wrap items-center gap-3 pt-2 mt-1 border-t border-border-subtle/50 text-xs text-text-muted">
                      {pricing.price_global_base_usd && (
                        <span>Global MSRP: <strong className="text-text-main">${pricing.price_global_base_usd.toLocaleString()} USD</strong></span>
                      )}
                      {pricing.price_global_base_eur && (
                        <span>• <strong className="text-text-main">€{pricing.price_global_base_eur.toLocaleString()} EUR</strong></span>
                      )}
                      {pricing.price_global_base_cny && (
                        <span>• <strong className="text-text-main">¥{pricing.price_global_base_cny.toLocaleString()} CNY</strong></span>
                      )}
                    </div>
                  )}
                </div>

                {/* Sibling Trim / Variant Selector */}
                {variants.length > 1 && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                      Available Trims & Variants ({variants.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {variants.map((v) => {
                        const isCurrent = v.slug === vehicle.slug;
                        return (
                          <Link
                            key={v._id}
                            href={`/vehicles/${v.slug}`}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all border ${
                              isCurrent
                                ? "bg-primary text-white border-primary shadow-xs"
                                : "bg-surface-white text-text-main border-border-subtle hover:border-primary hover:bg-surface-container-low"
                            }`}
                          >
                            <span>{v.variant_name || v.name}</span>
                            {v.price_pkr && (
                              <span className={`ml-1.5 opacity-80 ${isCurrent ? "text-white" : "text-text-muted"}`}>
                                (Rs. {(v.price_pkr / 100000).toFixed(1)} Lac)
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Top Features 3-Box Grid */}
                {highlights.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2.5">
                      Key Highlights
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {highlights.map((h, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2.5 p-3 rounded-md border border-border-subtle bg-surface-white hover:border-primary/50 transition-colors shadow-2xs"
                        >
                          <div className="w-8 h-8 rounded-sm bg-blue-50 text-primary flex items-center justify-center shrink-0">
                            <AppIcon name={h.icon} size={17} />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                              {h.label}
                            </span>
                            <span className="text-xs font-bold text-text-main leading-snug">
                              {h.value}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dealership / Retailer Price Comparison (if available) */}
          {hasAffiliateUrls && (
            <section className="bg-surface-white border border-border-subtle rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 md:px-6 border-b border-border-subtle bg-surface-container-low/30 flex items-center justify-between">
                <h2 className="font-headline-md text-base md:text-lg font-bold text-text-main flex items-center gap-2">
                  <AppIcon name="storefront" size={20} className="text-primary" />
                  Dealership & Retailer Prices in Pakistan
                </h2>
              </div>

              <div className="divide-y divide-border-subtle">
                {vehicle.prices && vehicle.prices.length > 0 ? (
                  vehicle.prices.map((priceItem, index) => (
                    <div
                      key={index}
                      className="p-4 md:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-container-lowest transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-surface-container-low border border-border-subtle rounded-xl flex items-center justify-center font-bold text-primary text-base uppercase shrink-0">
                          {priceItem.retailer_name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-text-main">
                            {priceItem.retailer_name}
                          </div>
                          <div className="text-xs text-price-green font-medium flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-price-green" />
                            {priceItem.stock_status || "In Stock"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto pt-3 md:pt-0 border-t border-border-subtle md:border-0">
                        <div className="text-lg font-bold text-text-main">
                          Rs. {priceItem.price_pkr.toLocaleString()}
                        </div>
                        {priceItem.product_url ? (
                          <a
                            href={priceItem.product_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-primary hover:bg-primary/90 text-white text-xs px-5 h-9 rounded-xl font-semibold flex items-center justify-center transition-all shadow-sm"
                          >
                            Visit Dealer
                          </a>
                        ) : (
                          <button
                            className="bg-surface-container-low text-text-muted text-xs px-4 h-9 rounded-xl font-semibold cursor-not-allowed border border-border-subtle"
                            disabled
                          >
                            Direct Booking
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : null}
              </div>
            </section>
          )}

          {/* Main Specifications and Sidebar Layout */}
          <div id="full-specs" className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left 2 Cols: Specs Table & Description */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Full Specs Accordion */}
              <EVSpecs vehicle={vehicle} />

              {/* Editorial / AI Description */}
              <EVDescriptionClient
                description={vehicle.description}
                vehicleName={vehicle.name}
                pros={vehicle.seo?.ai_pros}
                cons={vehicle.seo?.ai_cons}
                buyingAdvice={vehicle.seo?.ai_buying_advice}
                faqs={vehicle.seo?.ai_faq}
              />

              {/* YouTube Video Review Embed */}
              {vehicle.video_url && (
                <section className="bg-surface-white border border-border-subtle rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-4 md:px-6 border-b border-border-subtle bg-surface-container-low/30 flex items-center gap-2">
                    <AppIcon name="smart_display" size={22} className="text-red-600" />
                    <h2 className="font-headline-md text-base md:text-lg font-bold text-text-main">
                      Video Review & Hands-on
                    </h2>
                  </div>
                  <div className="p-6 flex justify-center">
                    {getYouTubeEmbedId(vehicle.video_url) ? (
                      <div className="w-full max-w-3xl aspect-video rounded-xl overflow-hidden border border-border-subtle shadow-sm">
                        <iframe
                          className="w-full h-full"
                          src={`https://www.youtube.com/embed/${getYouTubeEmbedId(vehicle.video_url)}`}
                          title={`${vehicle.name} Video Review`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <a
                        href={vehicle.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary hover:underline font-semibold text-sm"
                      >
                        <AppIcon name="open_in_new" size={18} />
                        Watch Review on YouTube
                      </a>
                    )}
                  </div>
                </section>
              )}
            </div>

            {/* Right 1 Col: Sidebar & Competitors */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              {/* Competitors Card */}
              <div className="bg-surface-white border border-border-subtle rounded-xl p-5 shadow-sm">
                <h3 className="font-headline-sm text-sm font-bold text-text-main mb-4 flex items-center gap-2">
                  <AppIcon name="compare_arrows" size={18} className="text-primary" />
                  Similar & Competitor EVs
                </h3>

                {competitors.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {competitors.map((comp) => {
                      const compImg = comp.images?.find((img) => img.url)?.url;
                      const formattedPrice = comp.price_pkr
                        ? comp.price_pkr >= 1000000
                          ? `Rs. ${(comp.price_pkr / 100000).toFixed(1)} Lac`
                          : `Rs. ${comp.price_pkr.toLocaleString()}`
                        : "(Upcoming)";

                      return (
                        <Link
                          key={comp._id}
                          href={`/vehicles/${comp.slug}`}
                          className="flex flex-col rounded-md border border-border-subtle hover:border-primary hover:shadow-sm transition-all bg-surface-white overflow-hidden group"
                        >
                          <div className="relative aspect-[16/10] bg-surface-container-low flex items-center justify-center p-2">
                            <Image
                              src={compImg || "/placeholder-car.svg"}
                              alt={comp.name}
                              fill
                              className="object-contain mix-blend-darken group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="flex flex-col p-2.5 bg-surface-white">
                            <h4 className="font-semibold text-xs text-text-main group-hover:text-primary transition-colors line-clamp-2 min-h-[32px] leading-snug">
                              {comp.name}
                            </h4>
                            <span className="text-xs font-bold text-text-main mt-1">
                              {formattedPrice}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-text-muted">
                    No competitor {vehicle.ev_category ? `${vehicle.ev_category.toLowerCase()}s` : "vehicles"} found.
                  </p>
                )}
              </div>

              {/* Other Models from same brand */}
              {brandVehicles.length > 0 && (
                <div className="bg-surface-white border border-border-subtle rounded-2xl p-5 shadow-sm">
                  <h3 className="font-headline-sm text-sm font-bold text-text-main mb-3">
                    Other {vehicle.brand_slug.toUpperCase().replace("-", " ")} Electric Models
                  </h3>
                  <ul className="flex flex-col gap-2">
                    {brandVehicles.map((bv) => (
                      <li key={bv._id}>
                        <Link
                          href={`/vehicles/${bv.slug}`}
                          className="text-xs md:text-sm text-primary hover:underline line-clamp-1 flex items-center justify-between"
                        >
                          <span>{bv.name}</span>
                          {bv.price_pkr && (
                            <span className="text-text-muted text-xs font-normal">
                              Rs. {(bv.price_pkr / 100000).toFixed(1)} Lac
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Price bracket navigation */}
              {(() => {
                const budgetGroup = getBudgetLinks(vehicle.ev_category);
                return (
                  <div className="bg-surface-white border border-border-subtle rounded-2xl p-5 shadow-sm">
                    <h3 className="font-headline-sm text-sm font-bold text-primary mb-3">
                      {budgetGroup.title}
                    </h3>
                    <ul className="flex flex-col gap-2">
                      {budgetGroup.items.map((p) => (
                        <li key={p.price}>
                          <Link
                            href={`/vehicles?${budgetGroup.queryParam}&max_price=${p.price}`}
                            className="text-xs md:text-sm text-text-main hover:text-primary transition-colors flex items-center justify-between"
                          >
                            <span>{p.label}</span>
                            <AppIcon name="chevron_right" size={14} className="text-text-muted" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })()}

              {/* Ad Slot */}
              <div className="rounded-2xl overflow-hidden">
                <AdSlot placement="SIDEBAR" layout="col" />
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
