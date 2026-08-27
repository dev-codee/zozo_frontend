import Image from "next/image";
import Link from "next/link";
import type { Vehicle } from "@/app/lib/api";
import AppIcon from "./AppIcon";

interface EVCardProps {
  vehicle: Vehicle;
  variant?: "list" | "grid";
  priority?: boolean;
}

export default function EVCard({ vehicle, variant = "list", priority = false }: EVCardProps) {
  const primaryImage = vehicle.images?.find((img) => img.url) || vehicle.images?.[0];
  const imageUrl = primaryImage?.url || "/placeholder-car.svg";
  const imageAlt = primaryImage?.alt_text || vehicle.name;

  const rawPriceStr = String(vehicle.price_pkr || "");
  const parsedPricePkr = Number(rawPriceStr.replace(/[^0-9.]/g, ''));
  const validPrices = (vehicle.prices || []).map((p) => Number(p.price_pkr)).filter(p => !isNaN(p) && p > 0);
  const lowestPrice = (!isNaN(parsedPricePkr) && parsedPricePkr > 0) ? parsedPricePkr : (validPrices.length ? Math.min(...validPrices) : null);

  const batteryUsable = vehicle.specs?.battery?.capacity_usable_kwh;
  const batteryGross = vehicle.specs?.battery?.capacity_gross_kwh;
  const battery = batteryUsable ? `${batteryUsable} kWh (Usable)` : batteryGross ? `${batteryGross} kWh` : "Battery TBA";

  const rangeWltp = vehicle.specs?.range_and_efficiency?.wltp_combined_km;
  const rangeEpa = vehicle.specs?.range_and_efficiency?.epa_combined_km;
  const range = rangeWltp ? `${rangeWltp} km (WLTP)` : rangeEpa ? `${rangeEpa} km (EPA)` : "Range TBA";

  const accel = vehicle.specs?.powertrain?.acceleration_0_100_kmh ? `${vehicle.specs.powertrain.acceleration_0_100_kmh}s (0-100 km/h)` : "Acceleration TBA";
  const power = vehicle.specs?.powertrain?.total_power_hp ? `${vehicle.specs.powertrain.total_power_hp} HP` : "Power TBA";
  const drive = vehicle.specs?.powertrain?.drive_layout || "Drive TBA";

  const userRating = vehicle.rating?.average || vehicle.ratings?.overall || 0;

  return (
    <div className={`flex flex-col bg-surface-white border border-border-subtle rounded-xl p-4 md:p-6 transition-all duration-300 hover:shadow-card group relative ${variant === 'list' ? 'w-full' : 'w-full max-w-sm mx-auto'}`}>
      
      {/* Title & Price Section */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <Link href={`/vehicles/${vehicle.slug}`} className="block">
            <h2 className="text-xl md:text-2xl font-bold text-text-main group-hover:text-primary transition-colors line-clamp-2 leading-tight">
              {vehicle.name}
            </h2>
          </Link>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface-container-high text-text-muted uppercase tracking-wider">
              {vehicle.ev_category || 'Vehicle'}
            </span>
            {vehicle.body_type && (
              <span className="text-xs font-medium text-text-muted border-l border-border-subtle pl-2">
                {vehicle.body_type}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col md:items-end shrink-0">
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-semibold text-text-muted">Rs.</span>
            <span className="text-2xl font-bold text-text-main">
              {lowestPrice ? lowestPrice.toLocaleString() : 'TBA'}
            </span>
          </div>
          {lowestPrice ? (
             <span className="text-xs text-text-muted uppercase tracking-wider font-semibold mt-0.5">Starting Price</span>
          ) : (
            <span className="text-xs text-text-muted uppercase tracking-wider font-semibold mt-0.5">Expected Price</span>
          )}
        </div>
      </div>

      <div className={`grid grid-cols-1 ${variant === 'list' ? 'md:grid-cols-12 pl-4' : 'px-2'} gap-6`}>
        {/* Left Column (Image) */}
        <div className={`${variant === 'list' ? 'md:col-span-4 lg:col-span-3' : 'w-full max-w-[200px] mx-auto'} flex flex-col items-center`}>
          <Link href={`/vehicles/${vehicle.slug}`} className="relative w-full aspect-[4/3] bg-surface-container-low rounded-xl p-4 flex items-center justify-center group overflow-hidden">
            <div className="relative w-full h-full">
              <Image
                src={imageUrl}
                alt={imageAlt}
                fill
                priority={priority}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 250px"
                className="object-contain mix-blend-darken group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </Link>
        </div>

        {/* Right Column (Specs) */}
        <div className={`${variant === 'list' ? 'md:col-span-8 lg:col-span-9' : 'w-full'} flex flex-col justify-between`}>
          <div>
            <ul className="space-y-3 mb-4 relative grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <li className="flex items-start gap-3 text-sm text-text-main">
                <AppIcon name="battery_charging_full" size={18} className="text-text-muted shrink-0 mt-0.5" />
                {battery}
              </li>
              <li className="flex items-start gap-3 text-sm text-text-main">
                <AppIcon name="speed" size={18} className="text-text-muted shrink-0 mt-0.5" />
                {range}
              </li>
              <li className="flex items-start gap-3 text-sm text-text-main">
                <AppIcon name="shutter_speed" size={18} className="text-text-muted shrink-0 mt-0.5" />
                {accel}
              </li>
              <li className="flex items-start gap-3 text-sm text-text-main">
                <AppIcon name="bolt" size={18} className="text-text-muted shrink-0 mt-0.5" />
                {power}
              </li>
              <li className="flex items-start gap-3 text-sm text-text-main sm:col-span-2">
                <AppIcon name="settings_ethernet" size={18} className="text-text-muted shrink-0 mt-0.5" />
                {drive}
              </li>
            </ul>

            <div className="flex justify-end border-b border-border-subtle/50 pb-4 mb-4">
              <Link href={`/vehicles/${vehicle.slug}`} className="text-xs font-bold text-text-main underline underline-offset-2 hover:text-primary">
                View All Specs
              </Link>
            </div>
          </div>

          <div>
            <div className={`grid grid-cols-1 gap-6`}>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <span className="text-xs text-text-muted w-20">Rating</span>
                    <div className="flex items-center gap-0.5 text-[#FF9800]">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = star <= Math.round(userRating);
                        return (
                          <AppIcon
                            key={star}
                            name={star <= userRating ? "star" : star - 0.5 <= userRating ? "star_half" : "star"}
                            size={16}
                            fill={isFilled ? "#FF9800" : "none"}
                            className="text-[#FF9800]"
                          />
                        );
                      })}
                      <span className="text-xs font-bold text-text-main ml-2">{userRating ? userRating.toFixed(1) : "N/A"}</span>
                    </div>
                  </div>
                  <Link
                    href={`/vehicles/${vehicle.slug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-text-main text-surface-white hover:bg-primary hover:text-on-primary rounded-lg transition-colors text-xs font-bold uppercase tracking-wider"
                  >
                    Details
                    <AppIcon name="chevron_right" size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
