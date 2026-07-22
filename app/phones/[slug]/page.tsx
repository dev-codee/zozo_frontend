import { notFound } from "next/navigation";
import Link from "next/link";
import { getPhoneBySlug } from "@/app/lib/api";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Breadcrumb from "@/app/components/Breadcrumb";
import PhoneGallery from "@/app/components/PhoneGallery";
import PhoneSpecs from "@/app/components/PhoneSpecs";
import PhoneDescriptionClient from "@/app/components/PhoneDescriptionClient";

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
    <>
      <Navbar />
      <main className="w-full max-w-[1280px] mx-auto px-4 md:px-6 py-8 flex flex-col gap-8 bg-surface">
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
              <span className="inline-flex items-center gap-1 bg-surface-container-low text-text-muted font-label-sm text-xs px-3 py-1 rounded-full mb-3 capitalize border border-border-subtle">
                {phone.brand_slug.replace("-", " ")}
              </span>
              <h1 className="font-headline-lg text-3xl md:text-4xl lg:text-5xl text-text-main mb-3 font-bold tracking-tight">
                {phone.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2">
                {rating ? (
                  <>
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
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
                    New Release
                  </span>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-display-lg text-3xl md:text-4xl font-bold text-price-green tracking-tight">
                {lowestPrice ? `Rs. ${lowestPrice.toLocaleString()}` : "Price TBA"}
              </span>
            </div>

            {/* PTA Tax Box */}
            {phone.pta_tax ? (
              <div className="bg-surface-container-low rounded-lg p-4 flex items-start gap-3 border border-border-subtle">
                <span className="material-symbols-outlined text-primary mt-0.5">
                  info
                </span>
                <div>
                  <h4 className="font-label-md text-sm font-semibold text-text-main">
                    PTA Tax (Passport): Rs. {phone.pta_tax.toLocaleString()}
                  </h4>
                  <p className="font-body-sm text-xs text-text-muted mt-1">
                    Estimated tax. Subject to change by FBR.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-surface-container-low rounded-lg p-4 flex items-start gap-3 border border-border-subtle">
                <span className="material-symbols-outlined text-outline mt-0.5">
                  info
                </span>
                <div>
                  <h4 className="font-label-md text-sm font-semibold text-text-main">
                    PTA Tax Info Unavailable
                  </h4>
                  <p className="font-body-sm text-xs text-text-muted mt-1">
                    Tax details for this model are not currently available.
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link
                href={`/compare?phone=${phone.slug}`}
                className="flex-1 bg-surface-white border border-border-subtle text-text-main hover:bg-surface-container-low hover:border-primary font-semibold text-sm px-6 h-12 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px]">
                  compare_arrows
                </span>
                Add to Compare
              </Link>
              <button className="flex-1 bg-surface-white border border-border-subtle text-text-main hover:bg-surface-container-low hover:border-primary font-semibold text-sm px-6 h-12 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm">
                <span className="material-symbols-outlined text-[20px]">
                  notifications
                </span>
                Set Price Alert
              </button>
            </div>
          </div>
        </div>



        {/* Key Specs Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
          <div className="bg-surface-white border border-border-subtle p-4 flex items-center gap-3 hover:shadow-md transition-shadow rounded-xl">
            <span className="material-symbols-outlined text-primary text-[28px] bg-primary/10 p-2 rounded-lg">
              memory
            </span>
            <div>
              <div className="font-label-sm text-xs text-text-muted uppercase tracking-wider font-semibold">
                RAM
              </div>
              <div className="font-label-md text-sm text-text-main font-semibold mt-0.5">
                {ramDisplay}
              </div>
            </div>
          </div>

          <div className="bg-surface-white border border-border-subtle p-4 flex items-center gap-3 hover:shadow-md transition-shadow rounded-xl">
            <span className="material-symbols-outlined text-primary text-[28px] bg-primary/10 p-2 rounded-lg">
              hard_drive
            </span>
            <div>
              <div className="font-label-sm text-xs text-text-muted uppercase tracking-wider font-semibold">
                Storage
              </div>
              <div className="font-label-md text-sm text-text-main font-semibold mt-0.5">
                {storageDisplay}
              </div>
            </div>
          </div>

          <div className="bg-surface-white border border-border-subtle p-4 flex items-center gap-3 hover:shadow-md transition-shadow rounded-xl">
            <span className="material-symbols-outlined text-primary text-[28px] bg-primary/10 p-2 rounded-lg">
              battery_charging_full
            </span>
            <div>
              <div className="font-label-sm text-xs text-text-muted uppercase tracking-wider font-semibold">
                Battery
              </div>
              <div className="font-label-md text-sm text-text-main font-semibold mt-0.5">
                {batteryDisplay}
              </div>
            </div>
          </div>

          <div className="bg-surface-white border border-border-subtle p-4 flex items-center gap-3 hover:shadow-md transition-shadow rounded-xl">
            <span className="material-symbols-outlined text-primary text-[28px] bg-primary/10 p-2 rounded-lg">
              photo_camera
            </span>
            <div className="overflow-hidden">
              <div className="font-label-sm text-xs text-text-muted uppercase tracking-wider font-semibold">
                Camera
              </div>
              <div className="font-label-md text-sm text-text-main font-semibold mt-0.5 truncate" title={cameraDisplay}>
                {cameraDisplay}
              </div>
            </div>
          </div>

          <div className="bg-surface-white border border-border-subtle p-4 flex items-center gap-3 hover:shadow-md transition-shadow rounded-xl">
            <span className="material-symbols-outlined text-primary text-[28px] bg-primary/10 p-2 rounded-lg">
              smartphone
            </span>
            <div>
              <div className="font-label-sm text-xs text-text-muted uppercase tracking-wider font-semibold">
                Display
              </div>
              <div className="font-label-md text-sm text-text-main font-semibold mt-0.5">
                {displayString}
              </div>
            </div>
          </div>

          <div className="bg-surface-white border border-border-subtle p-4 flex items-center gap-3 hover:shadow-md transition-shadow rounded-xl">
            <span className="material-symbols-outlined text-primary text-[28px] bg-primary/10 p-2 rounded-lg">
              developer_board
            </span>
            <div className="overflow-hidden">
              <div className="font-label-sm text-xs text-text-muted uppercase tracking-wider font-semibold">
                Chipset
              </div>
              <div className="font-label-md text-sm text-text-main font-semibold mt-0.5 truncate" title={chipsetFull}>
                {chipsetDisplay}
              </div>
            </div>
          </div>
        </div>

        {/* Price Comparison Table */}
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

        {/* Full Specifications Table */}
        <PhoneSpecs specs={phone.specs} />

        {/* Product Description */}
        <PhoneDescriptionClient slug={phone.slug} initialDescription={phone.description} />
      </main>
      <Footer />
    </>
  );
}
