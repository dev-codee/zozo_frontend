import Image from "next/image";
import Link from "next/link";
import type { Phone } from "@/app/lib/api";
import { filterVisibleTags } from "@/app/lib/tags";

interface PhoneCardProps {
  phone: Phone;
  variant?: "list" | "grid";
  priority?: boolean;
}

// Helper to extract a short snippet from markdown description
function getShortDescription(description?: string) {
  if (!description) return "A solid smartphone choice offering great value and performance for its price segment.";
  // Remove markdown headers, bolding, and icons
  let text = description.replace(/#/g, "").replace(/\*/g, "");
  text = text.replace(/help_outline|thumbs_up_down|check_circle|done|cancel|close/gi, "");
  // Get first 150 chars, up to a space
  if (text.length > 200) {
    return text.substring(0, 200).trim() + "...";
  }
  return text.trim();
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "TBA";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function getFirstProAndCon(description?: string) {
  if (!description) return null;

  const lines = description.split('\n').map(l => l.trim()).filter(Boolean);
  let pro = "";
  let con = "";
  let inPros = false;
  let inCons = false;

  for (let i = 0; i < lines.length; i++) {
    const lower = lines[i].toLowerCase();

    if (lower === 'pros' || lower === 'pros:') {
      inPros = true; inCons = false; continue;
    }
    if (lower === 'cons' || lower === 'cons:') {
      inCons = true; inPros = false; continue;
    }

    if (lower.startsWith('##') || lower.match(/^(design|display|performance|camera|battery|software)/)) {
      inPros = false; inCons = false;
    }

    if (inPros && !pro && !['thumbs_up_down', 'check_circle', 'done', 'cancel', 'close', '+', '-', '*'].includes(lower)) {
      pro = lines[i].replace(/^[+\-*•]\s*/, '').replace(/^:/, '').trim();
    }
    if (inCons && !con && !['thumbs_up_down', 'check_circle', 'done', 'cancel', 'close', '+', '-', '*'].includes(lower)) {
      con = lines[i].replace(/^[+\-*•]\s*/, '').replace(/^:/, '').trim();
    }

    if (pro && con) break;
  }

  if (!pro && !con) return null;

  return { pro, con };
}

function calculateSpecScore(phone: Phone): number {
  if (!phone?.specs) return 60 + ((phone?.name?.length || 0) % 5);

  let score = 30; // Start with a lower base score to allow for more granular additions

  // 1. Chipset Tier (Massive impact on flagship score - up to 20 points)
  const chipset = String(phone.specs.performance?.chipset || "").toLowerCase();
  if (chipset.includes("snapdragon 8") || chipset.includes("dimensity 9") || chipset.includes("apple a") || chipset.includes("exynos 24") || chipset.includes("exynos 22") || chipset.includes("tensor")) {
    score += 20;
  } else if (chipset.includes("snapdragon 7") || chipset.includes("dimensity 8") || chipset.includes("exynos 14") || chipset.includes("exynos 13")) {
    score += 14;
  } else if (chipset.includes("snapdragon 6") || chipset.includes("dimensity 7") || chipset.includes("helio g9") || chipset.includes("exynos 12")) {
    score += 8;
  } else if (chipset) {
    score += 4;
  }

  // 2. RAM (up to 10 points)
  const ramOptions = phone.specs.performance?.ram_options_gb || [];
  if (ramOptions.length > 0) {
    const maxRam = Math.max(...ramOptions);
    if (maxRam >= 12) score += 10;
    else if (maxRam >= 8) score += 7;
    else if (maxRam >= 6) score += 5;
    else if (maxRam >= 4) score += 2;
  }

  // 3. Storage (up to 8 points)
  const storageOptions = phone.specs.performance?.storage_options_gb || [];
  if (storageOptions.length > 0) {
    const maxStorage = Math.max(...storageOptions);
    if (maxStorage >= 512) score += 8;
    else if (maxStorage >= 256) score += 6;
    else if (maxStorage >= 128) score += 3;
    else if (maxStorage >= 64) score += 1;
  }

  // 4. Camera (up to 12 points)
  // Flagships often have OIS, telephoto, high MP count, 4k/8k video.
  const rearCamera = String(phone.specs.camera?.rear_summary || phone.specs.extra_specs?.cameras_detailed?.mp || "").toLowerCase();
  const video = String(phone.specs.camera?.video_recording || "").toLowerCase();
  
  if (rearCamera.includes("telephoto") || rearCamera.includes("periscope") || rearCamera.includes("zoom")) score += 4;
  if (rearCamera.includes("ois") || rearCamera.includes("optical image stabilization")) score += 3;
  if (rearCamera.includes("200 mp") || rearCamera.includes("108 mp") || rearCamera.includes("50 mp") || rearCamera.includes("48 mp")) score += 3;
  if (video.includes("8k") || video.includes("4k")) score += 2;

  // 5. Battery & Charging (up to 10 points)
  // Give points for decent battery, but heavily reward wireless charging (a true flagship feature)
  let batteryCap = phone.specs.battery?.capacity_mah || 0;
  if (!batteryCap && phone.specs.extra_specs?.battery_detailed?.capacity) {
     const parsed = parseInt(String(phone.specs.extra_specs.battery_detailed.capacity).replace(/\D/g, ''));
     if (!isNaN(parsed)) batteryCap = parsed;
  }
  if (batteryCap >= 5000) score += 4;
  else if (batteryCap >= 4000) score += 3;
  
  const chargingWatts = phone.specs.battery?.charging_watts || 0;
  if (chargingWatts >= 65) score += 3;
  else if (chargingWatts >= 25) score += 2;
  
  const hasWireless = phone.specs.battery?.wireless_charging || String(phone.specs.extra_specs?.battery_detailed?.charging || "").toLowerCase().includes("wireless");
  if (hasWireless) score += 3;

  // 6. Display (up to 10 points)
  const displayType = String(phone.specs.display?.type || phone.specs.extra_specs?.features_listing?.screen_size || "").toLowerCase();
  const resolution = String(phone.specs.display?.resolution || phone.specs.extra_specs?.features_listing?.resolution || "").toLowerCase();
  const refreshRate = phone.specs.display?.refresh_rate_hz || 0;

  if (displayType.includes("ltpo") || displayType.includes("amoled") || displayType.includes("oled") || displayType.includes("retina")) score += 4;
  else if (displayType.includes("ips") || displayType.includes("lcd")) score += 1;

  if (resolution.includes("1440") || resolution.includes("qhd") || resolution.includes("2k") || resolution.includes("4k")) score += 3;
  else if (resolution.includes("1080") || resolution.includes("fhd")) score += 1;

  if (refreshRate >= 120) score += 3;
  else if (refreshRate >= 90) score += 1;

  // 7. Premium Build Features (Water resistance, frame) (up to 5 points)
  const waterRes = String(phone.specs.body?.water_resistance || phone.specs.extra_specs?.features_listing?.water_resistance || "").toLowerCase();
  const materials = String(phone.specs.body?.materials || "").toLowerCase();

  if (waterRes.includes("ip68")) score += 3;
  else if (waterRes.includes("ip67") || waterRes.includes("ip53") || waterRes.includes("splash")) score += 1;

  if (materials.includes("titanium") || materials.includes("aluminum") || materials.includes("glass")) score += 2;

  // Small deterministic variance based on name length to give a unique feel
  score += ((phone.name || "").length % 4);

  return Math.min(Math.max(score, 50), 99); // Ensures score is between 50 and 99
}

export default function PhoneCard({ phone, variant = "list", priority = false }: PhoneCardProps) {
  // Get primary image or first image
  const primaryImage = phone.images?.find((img) => img.is_primary) || phone.images?.[0];
  const imageUrl = primaryImage?.url || "/placeholder-phone.svg";
  const imageAlt = primaryImage?.alt_text || phone.name;

  // Get lowest price safely
  const validPrices = (phone.prices || []).map((p) => p.price_pkr).filter(p => typeof p === 'number' && p > 0);
  const lowestPrice = phone.price_pkr || (validPrices.length ? Math.min(...validPrices) : null);

  const chipset = phone.specs?.performance?.chipset || "Chipset TBA";
  const ramOptions = phone.specs?.performance?.ram_options_gb;
  const storageOptions = phone.specs?.performance?.storage_options_gb;
  const ramStorage = (ramOptions || storageOptions)
    ? `${ramOptions ? Math.max(...ramOptions) : '??'} GB RAM | ${storageOptions ? Math.max(...storageOptions) : '??'} GB Storage`
    : "RAM & Storage TBA";

  const ext = phone.specs?.extra_specs || {};

  const rearCamera = phone.specs?.camera?.rear_summary || ext.cameras_detailed?.mp || "Rear Camera TBA";
  const frontCamera = phone.specs?.camera?.front_summary || ext.cameras_detailed?.front_mp || "Front Camera TBA";

  const battery = (phone.specs?.battery?.capacity_mah || phone.specs?.battery?.charging_watts)
    ? `${phone.specs?.battery?.capacity_mah || '??'} mAh | ${phone.specs?.battery?.charging_watts || '??'}W Charging`
    : ext.battery_detailed?.capacity ? `${ext.battery_detailed.capacity} mAh` : "Battery TBA";

  const display = (phone.specs?.display?.size_inches || phone.specs?.display?.type)
    ? `${phone.specs?.display?.size_inches || '??'} Inches | ${phone.specs?.display?.type || 'Display'}`
    : ext.features_listing?.screen_size ? `${ext.features_listing.screen_size} | Display` : "Display TBA";

  // Dummy Antutu score since we don't have it structured in DB yet
  const antutuScore = "Approx. 1,000,000";

  // Ratings
  const userRating = phone.rating?.average || 0;
  const expertRating = 8.5; // Placeholder
  const phoneData = getFirstProAndCon(phone.description);
  const specScore = calculateSpecScore(phone);
  const visibleTags = filterVisibleTags(phone.tags);

  return (
    <div className="bg-white border border-border-subtle rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">

      {/* Top Section */}
      <div className="p-5 md:p-6 pb-4 relative">
        {visibleTags.length > 0 && (
          <div className="absolute top-2 left-6 text-[10px] font-bold text-[#E53935] bg-[#E53935]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
            {visibleTags[0]}
          </div>
        )}
        {/* Header */}
        <div className={`flex justify-between items-start mb-2 ${visibleTags.length > 0 ? 'mt-4' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-primary rounded-full"></div>
            <Link href={`/${phone.slug}-price-in-pakistan`} className="hover:text-primary transition-colors">
              <h2 className={`font-headline-md font-bold text-text-main leading-tight ${variant === 'list' ? 'text-xl md:text-2xl' : 'text-lg'}`}>
                {phone.name}
              </h2>
            </Link>
          </div>
          {variant === "list" && (
            <Link
              href={`/compare?phone=${phone.slug}`}
              className="flex items-center gap-1 text-primary text-sm font-semibold hover:bg-primary/5 px-2 py-1 rounded transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Compare
            </Link>
          )}
        </div>

        <div className="text-xs text-text-muted mb-4 pl-4">
          Release Date: <span className="font-medium text-text-main">{formatDate(phone.release_date)}</span>
        </div>

        {variant === "list" && (
          <p className="text-sm text-text-muted leading-relaxed line-clamp-2 pl-4 mb-6">
            {getShortDescription(phone.description)} <Link href={`/${phone.slug}-price-in-pakistan`} className="font-bold text-text-main hover:text-primary">read more</Link>
          </p>
        )}

        {/* Grid for Image and Specs */}
        <div className={`grid grid-cols-1 ${variant === 'list' ? 'md:grid-cols-12 pl-4' : 'px-2'} gap-6`}>

          {/* Left Column (Image) */}
          <div className={`${variant === 'list' ? 'md:col-span-4 lg:col-span-3' : 'w-full max-w-[200px] mx-auto'} flex flex-col items-center`}>
            <Link href={`/${phone.slug}-price-in-pakistan`} className="relative w-full aspect-[3/4] bg-surface-container-low rounded-xl p-4 flex items-center justify-center group overflow-hidden">
              <div className={`absolute top-2 left-2 ${specScore >= 80 ? 'bg-[#8BC34A]' : specScore >= 65 ? 'bg-[#FFB300]' : 'bg-[#E53935]'} text-white text-[10px] font-bold px-1.5 py-1 rounded flex flex-col items-center shadow-sm z-10 leading-tight`}>
                <span>{specScore}%</span>
                <span className="text-[7px] font-medium opacity-90 text-center uppercase tracking-wider">Spec<br />Score</span>
              </div>
              <div className="relative w-full h-full">
                <Image
                  src={imageUrl}
                  alt={imageAlt}
                  fill
                  priority={priority}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-contain mix-blend-darken group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </Link>

            <div className="flex gap-4 mt-3">
              <Link
                href={`/compare?phone=${phone.slug}`}
                className="w-8 h-8 rounded border border-border-subtle flex items-center justify-center text-text-muted hover:border-primary hover:text-primary transition-colors"
                title="Compare"
              >
                <span className="material-symbols-outlined text-[18px]">compare_arrows</span>
              </Link>
              <button className="w-8 h-8 rounded border border-border-subtle flex items-center justify-center text-text-muted hover:border-primary hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[18px]">photo_camera</span>
              </button>
            </div>

            <Link href={`/${phone.slug}-price-in-pakistan`} className="text-xs font-bold text-text-main underline underline-offset-2 mt-2 hover:text-primary">
              View Photos ({phone.images?.length || 0})
            </Link>
          </div>

          {/* Right Column (Specs) */}
          <div className={`${variant === 'list' ? 'md:col-span-8 lg:col-span-9' : 'w-full'} flex flex-col justify-between`}>
            <div>
              <ul className="space-y-3 mb-4 relative">
                <li className="flex items-start gap-3 text-sm text-text-main">
                  <span className="material-symbols-outlined text-[20px] text-text-muted shrink-0 mt-0.5">developer_board</span>
                  {chipset}
                </li>
                <li className="flex items-start gap-3 text-sm text-text-main">
                  <span className="material-symbols-outlined text-[20px] text-text-muted shrink-0 mt-0.5">memory</span>
                  {ramStorage}
                </li>
                <li className="flex items-start gap-3 text-sm text-text-main">
                  <span className="material-symbols-outlined text-[20px] text-text-muted shrink-0 mt-0.5">photo_camera</span>
                  {rearCamera}
                </li>
                <li className="flex items-start gap-3 text-sm text-text-main">
                  <span className="material-symbols-outlined text-[20px] text-text-muted shrink-0 mt-0.5">camera_front</span>
                  {frontCamera}
                </li>
                <li className="flex items-start gap-3 text-sm text-text-main">
                  <span className="material-symbols-outlined text-[20px] text-text-muted shrink-0 mt-0.5">battery_charging_full</span>
                  {battery}
                </li>
                <li className="flex items-start gap-3 text-sm text-text-main">
                  <span className="material-symbols-outlined text-[20px] text-text-muted shrink-0 mt-0.5">smartphone</span>
                  {display}
                </li>

                {/* Ellipsis button for extra menu */}
                <button className="absolute top-0 right-0 text-text-muted hover:text-text-main">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </ul>

              <div className="flex justify-end border-b border-border-subtle/50 pb-4 mb-4">
                <Link href={`/${phone.slug}-price-in-pakistan`} className="text-xs font-bold text-text-main underline underline-offset-2 hover:text-primary">
                  View All Specs
                </Link>
              </div>
            </div>

            <div>
              {/* Ratings & Pros/Cons */}
              <div className={`grid grid-cols-1 ${variant === 'list' ? 'lg:grid-cols-2' : ''} gap-6`}>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-6">
                    <span className="text-xs text-text-muted w-20">Rating</span>
                    <div className="flex items-center gap-0.5 text-[#FF9800]">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className="material-symbols-outlined text-[16px]"
                          style={{ fontVariationSettings: star <= userRating ? "'FILL' 1" : star - 0.5 <= userRating ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          {star <= userRating ? 'star' : star - 0.5 <= userRating ? 'star_half' : 'star'}
                        </span>
                      ))}
                      <span className="ml-1 text-sm font-bold text-text-main">{userRating > 0 ? userRating.toFixed(1) : "0"}/5</span>
                    </div>
                  </div>
                </div>

                {phoneData && variant === "list" && (
                  <div className="flex flex-col gap-2">
                    {phoneData.pro && (
                      <p className="text-xs text-text-main line-clamp-2">
                        <span className="font-bold text-[#8BC34A]">Pros:</span> {phoneData.pro}
                      </p>
                    )}
                    {phoneData.con && (
                      <p className="text-xs text-text-main line-clamp-2">
                        <span className="font-bold text-[#F44336]">Cons:</span> {phoneData.con}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-2">
                <Link href={`/${phone.slug}-price-in-pakistan`} className="text-xs font-bold text-text-main underline underline-offset-2 hover:text-primary">
                  Read Full Review
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Strip */}
      <div className="bg-surface-container-lowest border-t border-border-subtle p-3 px-6 flex items-center justify-between">
        <span className="font-bold text-text-main text-lg">
          {lowestPrice ? `Rs. ${lowestPrice.toLocaleString()}` : "Price TBA"}
        </span>

        <Link
          href={`/${phone.slug}-price-in-pakistan`}
          className="text-[#FF9800] font-bold text-sm hover:underline"
        >
          View Details
        </Link>
      </div>

    </div>
  );
}
