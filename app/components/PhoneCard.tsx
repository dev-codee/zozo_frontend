import Image from "next/image";
import Link from "next/link";
import type { Phone } from "@/app/lib/api";

interface PhoneCardProps {
  phone: Phone;
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

export default function PhoneCard({ phone }: PhoneCardProps) {
  // Get primary image or first image
  const primaryImage = phone.images?.find((img) => img.is_primary) || phone.images?.[0];
  const imageUrl = primaryImage?.url || "/placeholder-phone.svg";
  const imageAlt = primaryImage?.alt_text || phone.name;

  // Get lowest price
  const lowestPrice = phone.price_pkr || (phone.prices?.length
    ? Math.min(...phone.prices.map((p) => p.price_pkr))
    : null);

  const chipset = phone.specs?.performance?.chipset || "Chipset TBA";
  const ramOptions = phone.specs?.performance?.ram_options_gb;
  const storageOptions = phone.specs?.performance?.storage_options_gb;
  const ramStorage = `${ramOptions ? Math.max(...ramOptions) : '??'} GB RAM | ${storageOptions ? Math.max(...storageOptions) : '??'} GB Storage`;
  
  const rearCamera = phone.specs?.camera?.rear_summary || "Rear Camera TBA";
  const frontCamera = phone.specs?.camera?.front_summary || "Front Camera TBA";
  const battery = `${phone.specs?.battery?.capacity_mah || '??'} mAh | ${phone.specs?.battery?.charging_watts || '??'}W Charging`;
  const display = `${phone.specs?.display?.size_inches || '??'} Inches | ${phone.specs?.display?.type || 'Display'}`;
  
  // Dummy Antutu score since we don't have it structured in DB yet
  const antutuScore = "Approx. 1,000,000";

  // Ratings
  const userRating = phone.rating?.average || 4.5;
  const expertRating = 8.5; // Placeholder
  const phoneData = getFirstProAndCon(phone.description);

  return (
    <div className="bg-white border border-border-subtle rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      
      {/* Top Section */}
      <div className="p-5 md:p-6 pb-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-primary rounded-full"></div>
            <Link href={`/phones/${phone.slug}`} className="hover:text-primary transition-colors">
              <h2 className="font-headline-md text-xl md:text-2xl font-bold text-text-main leading-tight">
                {phone.name}
              </h2>
            </Link>
          </div>
          <button className="flex items-center gap-1 text-primary text-sm font-semibold hover:bg-primary/5 px-2 py-1 rounded transition-colors">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Compare
          </button>
        </div>

        <div className="text-xs text-text-muted mb-4 pl-4">
          Release Date: <span className="font-medium text-text-main">{formatDate(phone.release_date)}</span>
        </div>

        <p className="text-sm text-text-muted leading-relaxed line-clamp-2 pl-4 mb-6">
          {getShortDescription(phone.description)} <Link href={`/phones/${phone.slug}`} className="font-bold text-text-main hover:text-primary">read more</Link>
        </p>

        {/* Grid for Image and Specs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pl-4">
          
          {/* Left Column (Image) */}
          <div className="md:col-span-4 lg:col-span-3 flex flex-col items-center">
            <Link href={`/phones/${phone.slug}`} className="relative w-full aspect-[3/4] bg-surface-container-low rounded-xl p-4 flex items-center justify-center group overflow-hidden">
              <div className="absolute top-2 left-2 bg-[#8BC34A] text-white text-[10px] font-bold px-1.5 py-1 rounded flex flex-col items-center shadow-sm z-10 leading-tight">
                <span>97%</span>
                <span className="text-[7px] font-medium opacity-90 text-center uppercase tracking-wider">Spec<br/>Score</span>
              </div>
              <div className="relative w-full h-full">
                <Image
                  src={imageUrl}
                  alt={imageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-contain mix-blend-darken group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </Link>
            
            <div className="flex gap-4 mt-3">
              <button className="w-8 h-8 rounded border border-border-subtle flex items-center justify-center text-text-muted hover:border-primary hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[18px]">compare_arrows</span>
              </button>
              <button className="w-8 h-8 rounded border border-border-subtle flex items-center justify-center text-text-muted hover:border-primary hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[18px]">photo_camera</span>
              </button>
            </div>
            
            <Link href={`/phones/${phone.slug}`} className="text-xs font-bold text-text-main underline underline-offset-2 mt-2 hover:text-primary">
              View Photos ({phone.images?.length || 0})
            </Link>
          </div>

          {/* Right Column (Specs) */}
          <div className="md:col-span-8 lg:col-span-9 flex flex-col justify-between">
            <ul className="space-y-3 mb-6 relative">
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
              <Link href={`/phones/${phone.slug}`} className="text-xs font-bold text-text-main underline underline-offset-2 hover:text-primary">
                View All Specs
              </Link>
            </div>

            {/* Ratings & Pros/Cons */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-6">
                  <span className="text-xs text-text-muted w-20">User Rating</span>
                  <div className="flex items-center gap-1 font-bold text-sm text-text-main">
                    <span className="material-symbols-outlined text-[16px] text-[#FF9800]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    {userRating.toFixed(1)}/5
                  </div>
                </div>
              </div>
              
              {phoneData && (
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
              <Link href={`/phones/${phone.slug}`} className="text-xs font-bold text-text-main underline underline-offset-2 hover:text-primary">
                Read Full Review
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Strip */}
      <div className="bg-surface-container-lowest border-t border-border-subtle p-3 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Mock Amazon Logo */}
          <span className="font-bold text-text-main text-lg tracking-tighter">amazon</span>
        </div>
        
        <div className="flex items-center gap-6">
          <span className="font-bold text-text-main text-lg">
            {lowestPrice ? `Rs. ${lowestPrice.toLocaleString()}` : "Price TBA"}
          </span>
          <Link 
            href={`/phones/${phone.slug}`}
            className="text-[#FF9800] font-bold text-sm hover:underline"
          >
            Go To Store
          </Link>
        </div>
      </div>

    </div>
  );
}
