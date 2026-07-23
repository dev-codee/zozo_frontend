import Image from "next/image";
import Link from "next/link";
import type { Phone } from "@/app/lib/api";

interface PhoneCardProps {
  phone: Phone;
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

  // Build spec summary
  const ram = phone.specs?.performance?.ram_options_gb;
  const storage = phone.specs?.performance?.storage_options_gb;
  const specParts: string[] = [];
  if (ram?.length) specParts.push(`${Math.max(...ram)}GB RAM`);
  if (storage?.length) specParts.push(`${Math.max(...storage)}GB Storage`);
  const specSummary = specParts.join(", ") || "Specs TBA";

  // Rating or "New" badge
  const rating = phone.rating?.average;
  const isNew = phone.status === "upcoming" || !rating;

  return (
    <Link
      href={`/phones/${phone.slug}`}
      className="group block bg-surface-white border border-border-subtle overflow-hidden hover:shadow-[0_10px_15px_-3px_rgba(15,23,42,0.08)] transition-all duration-300 relative rounded-xl shadow-sm"
    >
      {/* Badge */}
      {isNew ? (
        <div className="absolute top-3 left-3 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium z-10 flex items-center gap-1 backdrop-blur-sm">
          New
        </div>
      ) : rating ? (
        <div className="absolute top-3 left-3 bg-tertiary-container/10 text-tertiary-container rounded-full px-3 py-1 text-xs font-medium z-10 flex items-center gap-1 backdrop-blur-sm">
          <span
            className="material-symbols-outlined text-[14px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            star
          </span>
          {rating.toFixed(1)}
        </div>
      ) : null}

      {/* Image */}
      <div className="h-56 bg-surface-container-lowest p-6 flex items-center justify-center border-b border-border-subtle">
        <div className="relative h-full w-full">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-sm font-semibold text-on-surface mb-1 truncate">
          {phone.name}
        </h3>
        <p className="text-sm text-text-muted mb-4 truncate">{specSummary}</p>
        <div className="flex justify-between items-center">
          <span className="text-lg text-price-green font-bold">
            {lowestPrice
              ? `Rs. ${lowestPrice.toLocaleString()}`
              : "Price TBA"}
          </span>
        </div>
      </div>
    </Link>
  );
}
