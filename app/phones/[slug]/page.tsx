import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { getPhoneBySlug } from "@/app/lib/api";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Breadcrumb from "@/app/components/Breadcrumb";
import PhoneGallery from "@/app/components/PhoneGallery";
import PhoneSpecs from "@/app/components/PhoneSpecs";
import PhoneDescriptionClient from "@/app/components/PhoneDescriptionClient";

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
  const lowestPrice = phone.prices?.length
    ? Math.min(...phone.prices.map((p) => p.price_pkr))
    : null;
  const rating = phone.rating?.average;
  const reviewCount = phone.rating?.count || 0;
  const hasAffiliateUrls = phone.prices?.some((p) => !!p.product_url);

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
  } else if (chipsetDisplay.length > 20) {
    chipsetDisplay = chipsetDisplay.substring(0, 20) + "...";
  }


  return (
    <div className="bg-white min-h-screen w-full flex flex-col">
      <Navbar />
      <main className="w-full max-w-[1280px] mx-auto px-4 md:px-6 py-8 flex flex-col gap-8 bg-white flex-1">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: phone.brand_slug.replace("-", " "), href: `/phones?brand=${phone.brand_slug}` },
            { label: phone.name },
          ]}
        />

        {/* Hero Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Gallery */}
          <PhoneGallery images={phone.images} altText={phone.name} />

          {/* Product Info */}
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1 bg-surface-container-low text-text-muted font-label-sm text-xs px-3 py-1 rounded-full capitalize border border-border-subtle">
                  {phone.brand_slug.replace("-", " ")}
                </span>
                {releaseDateStr && (
                  <span className="inline-flex items-center gap-1 bg-surface-container-low text-text-muted font-label-sm text-xs px-3 py-1 rounded-full border border-border-subtle">
                    Released: {releaseDateStr}
                  </span>
                )}
                {!rating && (
                  <span className="inline-flex items-center gap-1 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-semibold border border-primary/20">
                    New Release
                  </span>
                )}
              </div>
              <h1 className="font-headline-lg text-2xl md:text-3xl lg:text-4xl text-text-main mb-3 font-bold tracking-tight">
                {phone.name}
              </h1>

              {/* Rating */}
              {rating && (
                <div className="flex items-center gap-2">
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
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-display-lg text-2xl md:text-3xl font-bold text-price-green tracking-tight">
                {lowestPrice ? `Rs. ${lowestPrice.toLocaleString()}` : "Price TBA"}
              </span>
            </div>

            {/* PTA Tax Box is hidden for now */}

            {/* Key Specs */}
            <div className="mt-8 border-t border-border-subtle pt-6">
              <h2 className="text-lg font-bold text-text-main flex items-center gap-2 mb-6">
                <span className="w-1 h-6 bg-primary rounded-full"></span>
                Key Specs
              </h2>
              
              <div className="flex flex-col divide-y divide-border-subtle [&>div]:py-4 [&>div:first-child]:pt-0 [&>div:last-child]:pb-0">
                {/* OS */}
                {phone.specs.os && (
                  <div>
                    <div className="flex items-center gap-2 text-xs text-text-muted font-medium">
                      <span className="material-symbols-outlined text-primary text-base">android</span>
                      {phone.specs.os}
                    </div>
                  </div>
                )}

                {/* Performance */}
                {phone.specs.performance && (
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-text-main mb-2">
                      <span className="material-symbols-outlined text-text-muted text-base">speed</span>
                      Performance
                    </div>
                    <ul className="list-disc pl-8 text-xs text-text-muted space-y-1">
                      {chipsetFull && <li>{chipsetFull}</li>}
                      {phone.specs.performance.cpu && <li>{phone.specs.performance.cpu}</li>}
                      {ramDisplay !== "N/A" && <li>{ramDisplay} RAM</li>}
                    </ul>
                  </div>
                )}

                {/* Display */}
                {phone.specs.display && (
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-text-main mb-2">
                      <span className="material-symbols-outlined text-text-muted text-base">smartphone</span>
                      Display
                    </div>
                    <ul className="list-disc pl-8 text-xs text-text-muted space-y-1">
                      {phone.specs.display.size_inches && <li>{phone.specs.display.size_inches} inches ({Math.round(phone.specs.display.size_inches * 2.54)} cm); {phone.specs.display.type || 'Display'}</li>}
                      {phone.specs.display.resolution && <li>{phone.specs.display.resolution}</li>}
                      {phone.specs.display.refresh_rate_hz && <li>{phone.specs.display.refresh_rate_hz} Hz Refresh Rate</li>}
                      {phone.specs.display.protection && <li>{phone.specs.display.protection}</li>}
                    </ul>
                  </div>
                )}

                {/* Rear Camera */}
                {phone.specs.camera?.rear_summary && (
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-text-main mb-2">
                      <span className="material-symbols-outlined text-text-muted text-base">photo_camera</span>
                      Rear Camera
                    </div>
                    <ul className="list-disc pl-8 text-xs text-text-muted space-y-1">
                      <li>{phone.specs.camera.rear_summary}</li>
                      {phone.specs.camera.video_recording && <li>{phone.specs.camera.video_recording} Video Recording</li>}
                    </ul>
                  </div>
                )}

                {/* Front Camera */}
                {phone.specs.camera?.front_summary && (
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-text-main mb-2">
                      <span className="material-symbols-outlined text-text-muted text-base">photo_camera_front</span>
                      Front Camera
                    </div>
                    <ul className="list-disc pl-8 text-xs text-text-muted space-y-1">
                      <li>{phone.specs.camera.front_summary}</li>
                    </ul>
                  </div>
                )}

                {/* Battery */}
                {phone.specs.battery && (
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-text-main mb-2">
                      <span className="material-symbols-outlined text-text-muted text-base">battery_charging_full</span>
                      Battery
                    </div>
                    <ul className="list-disc pl-8 text-xs text-text-muted space-y-1">
                      {phone.specs.battery.capacity_mah && <li>{phone.specs.battery.capacity_mah} mAh</li>}
                      {phone.specs.battery.charging_watts && <li>{phone.specs.battery.charging_watts}W Fast Charging</li>}
                    </ul>
                  </div>
                )}

                {/* General */}
                {phone.specs.connectivity && (
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-text-main mb-2">
                      <span className="material-symbols-outlined text-text-muted text-base">memory</span>
                      General
                    </div>
                    <ul className="list-disc pl-8 text-xs text-text-muted space-y-1">
                      {releaseDateStr && <li>Released: {releaseDateStr}</li>}
                      {phone.specs.connectivity.sim && <li>SIM: {phone.specs.connectivity.sim}</li>}
                      {phone.specs.connectivity.network && <li>{phone.specs.connectivity.network} Supported</li>}
                      {storageDisplay !== "N/A" && <li>{storageDisplay} internal storage</li>}
                      {phone.specs.body?.water_resistance && <li>{phone.specs.body.water_resistance}</li>}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Link
                href={`/compare?phone=${phone.slug}`}
                className="flex-1 bg-surface-white border border-border-subtle text-text-main hover:bg-surface-container-low hover:border-primary font-semibold text-xs px-6 h-12 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">
                  compare_arrows
                </span>
                Add to Compare
              </Link>
              <button className="flex-1 bg-surface-white border border-border-subtle text-text-main hover:bg-surface-container-low hover:border-primary font-semibold text-xs px-6 h-12 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm">
                <span className="material-symbols-outlined text-[18px]">
                  notifications
                </span>
                Set Price Alert
              </button>
            </div>
          </div>
        </div>

        {/* Price Comparison Table */}
        {hasAffiliateUrls && (
          <section className="bg-surface-white border border-border-subtle rounded-xl overflow-hidden shadow-sm mt-8">
            <div className="p-6 border-b border-border-subtle bg-surface-container-low/30">
              <h2 className="font-headline-md text-2xl font-bold text-text-main">
                Price Comparison
              </h2>
            </div>

            <div className="divide-y divide-border-subtle">
              {phone.prices && phone.prices.length > 0 ? (
                phone.prices.map((priceItem, index) => (
                  <div
                    key={index}
                    className="p-4 md:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-container-lowest transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-surface-container-low border border-border-subtle rounded-lg flex items-center justify-center font-bold text-primary text-xl uppercase shadow-sm">
                        {priceItem.retailer_name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-label-md text-base font-semibold text-text-main">
                          {priceItem.retailer_name}
                        </div>
                        <div className="font-body-sm text-sm text-price-green font-medium flex items-center gap-1 mt-0.5">
                          <span className="w-2 h-2 rounded-full bg-price-green"></span>
                          {priceItem.stock_status || "In Stock"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t border-border-subtle md:border-0">
                      <div className="font-headline-md text-xl font-bold text-text-main">
                        Rs. {priceItem.price_pkr.toLocaleString()}
                      </div>
                      {priceItem.product_url ? (
                        <a
                          href={priceItem.product_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-primary hover:bg-on-primary-fixed-variant text-white font-label-md text-sm px-8 h-11 transition-all shadow-md hover:shadow-lg rounded-lg font-semibold flex items-center justify-center cursor-pointer"
                        >
                          Buy Now
                        </a>
                      ) : (
                        <button
                          className="bg-surface-container-low text-text-muted font-label-md text-sm px-8 h-11 rounded-lg font-semibold flex items-center justify-center cursor-not-allowed border border-border-subtle"
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

        {/* Full Specifications Table */}
        <PhoneSpecs specs={phone.specs} />

        {/* Product Description */}
        <PhoneDescriptionClient slug={phone.slug} initialDescription={phone.description} />
      </main>
      <Footer />
    </div>
  );
}
