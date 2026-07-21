"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Phone } from "@/app/lib/api";
import AIVerdictClient from "@/app/components/AIVerdictClient";

interface CompareClientProps {
  initialPhones: Phone[];
  allPhones: Phone[];
}

interface SpecField {
  label: string;
  getValue: (p: Phone) => React.ReactNode;
}

interface SpecCategory {
  name: string;
  icon: string;
  fields: SpecField[];
}

export default function CompareClient({ initialPhones, allPhones }: CompareClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Support up to 3 comparison slots
  const maxSlots = 3;
  const slots: (Phone | null)[] = Array.from({ length: maxSlots }, (_, i) => initialPhones[i] || null);

  // Specifications Categories Schema
  const categories: SpecCategory[] = [
    {
      name: "General info",
      icon: "info",
      fields: [
        {
          label: "Price (lowest)",
          getValue: (p: Phone) => {
            const lowest = p.prices?.length
              ? Math.min(...p.prices.map((pr) => pr.price_pkr))
              : null;
            return lowest ? `Rs. ${lowest.toLocaleString()}` : "Price TBA";
          },
        },
        {
          label: "PTA Tax (Passport)",
          getValue: (p: Phone) =>
            p.pta_tax ? `Rs. ${p.pta_tax.toLocaleString()}` : "Unavailable",
        },
        {
          label: "Release Status",
          getValue: (p: Phone) => (
            <span className="capitalize">{p.status.replace("_", " ")}</span>
          ),
        },
      ],
    },
    {
      name: "Performance",
      icon: "memory",
      fields: [
        { label: "Chipset", getValue: (p: Phone) => p.specs.performance?.chipset || "N/A" },
        { label: "Processor (CPU)", getValue: (p: Phone) => p.specs.performance?.cpu || "N/A" },
        { label: "Graphics (GPU)", getValue: (p: Phone) => p.specs.performance?.gpu || "N/A" },
        {
          label: "RAM Options",
          getValue: (p: Phone) =>
            p.specs.performance?.ram_options_gb?.length
              ? `${p.specs.performance.ram_options_gb.join(" GB / ")} GB`
              : "N/A",
        },
        {
          label: "Storage Options",
          getValue: (p: Phone) =>
            p.specs.performance?.storage_options_gb?.length
              ? `${p.specs.performance.storage_options_gb.join(" GB / ")} GB`
              : "N/A",
        },
        {
          label: "Expandable Storage",
          getValue: (p: Phone) =>
            p.specs.performance?.expandable_storage !== undefined
              ? p.specs.performance.expandable_storage
                ? "Yes"
                : "No"
              : "N/A",
        },
      ],
    },
    {
      name: "Display",
      icon: "smartphone",
      fields: [
        {
          label: "Screen Size",
          getValue: (p: Phone) =>
            p.specs.display?.size_inches ? `${p.specs.display.size_inches} inches` : "N/A",
        },
        { label: "Display Type", getValue: (p: Phone) => p.specs.display?.type || "N/A" },
        { label: "Resolution", getValue: (p: Phone) => p.specs.display?.resolution || "N/A" },
        {
          label: "Refresh Rate",
          getValue: (p: Phone) =>
            p.specs.display?.refresh_rate_hz ? `${p.specs.display.refresh_rate_hz} Hz` : "N/A",
        },
        { label: "Protection", getValue: (p: Phone) => p.specs.display?.protection || "N/A" },
        {
          label: "Peak Brightness",
          getValue: (p: Phone) =>
            p.specs.display?.peak_brightness_nits
              ? `${p.specs.display.peak_brightness_nits} nits`
              : "N/A",
        },
      ],
    },
    {
      name: "Camera",
      icon: "photo_camera",
      fields: [
        { label: "Rear Camera", getValue: (p: Phone) => p.specs.camera?.rear_summary || "N/A" },
        { label: "Selfie Camera", getValue: (p: Phone) => p.specs.camera?.front_summary || "N/A" },
        { label: "Video Recording", getValue: (p: Phone) => p.specs.camera?.video_recording || "N/A" },
      ],
    },
    {
      name: "Battery",
      icon: "battery_charging_full",
      fields: [
        {
          label: "Capacity",
          getValue: (p: Phone) =>
            p.specs.battery?.capacity_mah ? `${p.specs.battery.capacity_mah} mAh` : "N/A",
        },
        {
          label: "Charging Speed",
          getValue: (p: Phone) =>
            p.specs.battery?.charging_watts ? `${p.specs.battery.charging_watts}W` : "N/A",
        },
        {
          label: "Fast Charging",
          getValue: (p: Phone) =>
            p.specs.battery?.fast_charging !== undefined
              ? p.specs.battery.fast_charging
                ? "Yes"
                : "No"
              : "N/A",
        },
        {
          label: "Wireless Charging",
          getValue: (p: Phone) =>
            p.specs.battery?.wireless_charging !== undefined
              ? p.specs.battery.wireless_charging
                ? "Yes"
                : "No"
              : "N/A",
        },
      ],
    },
    {
      name: "Body & Design",
      icon: "design_services",
      fields: [
        {
          label: "Dimensions",
          getValue: (p: Phone) =>
            p.specs.body?.height_mm && p.specs.body?.width_mm && p.specs.body?.thickness_mm
              ? `${p.specs.body.height_mm} x ${p.specs.body.width_mm} x ${p.specs.body.thickness_mm} mm`
              : "N/A",
        },
        {
          label: "Weight",
          getValue: (p: Phone) => (p.specs.body?.weight_g ? `${p.specs.body.weight_g} g` : "N/A"),
        },
        { label: "Build Materials", getValue: (p: Phone) => p.specs.body?.materials || "N/A" },
        { label: "Water Resistance", getValue: (p: Phone) => p.specs.body?.water_resistance || "N/A" },
      ],
    },
    {
      name: "Connectivity & OS",
      icon: "wifi",
      fields: [
        { label: "Operating System", getValue: (p: Phone) => p.specs.os || "N/A" },
        { label: "Network Support", getValue: (p: Phone) => p.specs.connectivity?.network || "N/A" },
        { label: "SIM Options", getValue: (p: Phone) => p.specs.connectivity?.sim || "N/A" },
        { label: "Bluetooth", getValue: (p: Phone) => p.specs.connectivity?.bluetooth || "N/A" },
        { label: "USB", getValue: (p: Phone) => p.specs.connectivity?.usb || "N/A" },
        {
          label: "NFC Support",
          getValue: (p: Phone) =>
            p.specs.connectivity?.nfc !== undefined
              ? p.specs.connectivity.nfc
                ? "Yes"
                : "No"
              : "N/A",
        },
      ],
    },
  ];

  // Update query parameters in the URL
  const updateUrl = (newSlots: (Phone | null)[]) => {
    const params = new URLSearchParams();
    newSlots.forEach((p) => {
      if (p) {
        params.append("phone", p.slug);
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  // Add phone to slot
  const handleAddPhone = (phone: Phone, index: number) => {
    const newSlots = [...slots];
    newSlots[index] = phone;
    updateUrl(newSlots);
  };

  // Remove phone from slot
  const handleRemovePhone = (index: number) => {
    const newSlots = [...slots];
    newSlots[index] = null;
    updateUrl(newSlots);
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 md:px-6 py-8 flex flex-col gap-6 bg-surface min-h-[80vh]">
      {/* Header Info */}
      <div className="flex flex-col gap-2">
        <h1 className="font-headline-lg text-3xl md:text-4xl font-bold text-text-main tracking-tight">
          Compare Phones
        </h1>
        <p className="font-body-md text-text-muted text-sm md:text-base">
          Add up to {maxSlots} devices to compare prices, PTA taxes, and full specifications side-by-side.
        </p>
      </div>

      {/* AI Verdict Section */}
      <AIVerdictClient slugs={slots.filter((p) => p !== null).map((p) => p!.slug)} />

      {/* Responsive Scrollable Container */}
      <div className="w-full overflow-x-auto relative rounded-xl border border-border-subtle bg-surface-white shadow-sm scrollbar-thin">
        {/* Comparison Table Grid */}
        <div className="min-w-[850px] md:min-w-full grid grid-cols-[180px_1fr_1fr_1fr] divide-x divide-border-subtle">
          
          {/* ── Sticky Header: Label Column Placeholder ── */}
          <div className="sticky left-0 bg-surface-white z-20 flex flex-col justify-end p-6 border-b border-border-subtle shadow-[4px_0_8px_-4px_rgba(0,0,0,0.06)] min-h-[300px]">
            <div className="font-headline-sm text-sm font-bold text-text-main uppercase tracking-wider mb-2">
              Devices
            </div>
            <p className="font-body-sm text-xs text-text-muted">
              Vertical side-by-side comparison.
            </p>
          </div>

          {/* ── Sticky Header: Phone Slots ── */}
          {slots.map((phone, index) => (
            <div
              key={index}
              className="p-6 flex flex-col items-center justify-between min-h-[300px] relative border-b border-border-subtle bg-surface-white group/slot"
            >
              {phone ? (
                <>
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemovePhone(index)}
                    className="absolute top-4 right-4 w-7 h-7 rounded-full bg-surface-container hover:bg-error/10 hover:text-error text-text-muted flex items-center justify-center cursor-pointer transition-colors shadow-sm"
                    title="Remove device"
                  >
                    <span className="material-symbols-outlined text-[18px] font-bold">close</span>
                  </button>

                  {/* Device Info */}
                  <div className="flex flex-col items-center text-center gap-3 w-full mt-4">
                    <div className="relative w-28 h-36 flex items-center justify-center bg-surface-container-lowest/50 p-2 rounded-lg border border-border-subtle/50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={phone.images?.[0]?.url || "/placeholder-phone.webp"}
                        alt={phone.name}
                        className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover/slot:scale-105"
                      />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                        {phone.brand_slug.replace("-", " ")}
                      </span>
                      <h3 className="font-headline-sm text-base font-bold text-text-main mt-0.5 line-clamp-1">
                        {phone.name}
                      </h3>
                      <p className="font-headline-md text-sm font-bold text-price-green mt-1">
                        {phone.prices?.length
                          ? `Rs. ${Math.min(...phone.prices.map((pr) => pr.price_pkr)).toLocaleString()}`
                          : "Price TBA"}
                      </p>
                    </div>
                  </div>

                  {/* Action Link to Details */}
                  <Link
                    href={`/phones/${phone.slug}`}
                    className="w-full mt-4 bg-surface-container-low hover:bg-primary/10 hover:text-primary text-text-main font-semibold text-xs py-2 px-4 rounded-lg text-center transition-colors border border-border-subtle"
                  >
                    View Details
                  </Link>
                </>
              ) : (
                <PhoneSearchSelector
                  index={index}
                  onSelect={(p) => handleAddPhone(p, index)}
                  allPhones={allPhones}
                  selectedSlugs={slots.filter((s) => s !== null).map((s) => s!.slug)}
                />
              )}
            </div>
          ))}

          {/* ── Table Spec Rows ── */}
          {categories.map((category, catIdx) => (
            <div key={catIdx} className="col-span-4 grid grid-cols-[180px_1fr_1fr_1fr] divide-x divide-border-subtle">
              {/* Category Header Bar */}
              <div className="col-span-4 bg-surface-container-low/40 py-3 px-6 flex items-center gap-2 border-b border-t border-border-subtle">
                <span className="material-symbols-outlined text-text-muted text-[18px]">{category.icon}</span>
                <h3 className="font-headline-sm text-sm font-bold text-text-main uppercase tracking-wider">
                  {category.name}
                </h3>
              </div>

              {/* Rows within Category */}
              {category.fields.map((field, fieldIdx) => (
                <div key={fieldIdx} className="col-span-4 grid grid-cols-[180px_1fr_1fr_1fr] divide-x divide-border-subtle border-b border-border-subtle/50 last:border-b-0 hover:bg-surface-container-lowest/30 transition-colors">
                  {/* Label (Sticky left) */}
                  <div className="sticky left-0 bg-surface-white z-10 py-3 px-5 text-xs font-semibold text-text-muted flex items-center border-r border-border-subtle shadow-[4px_0_8px_-4px_rgba(0,0,0,0.06)] min-h-[48px]">
                    {field.label}
                  </div>
                  
                  {/* Values */}
                  {slots.map((phone, index) => (
                    <div key={index} className="py-3 px-5 text-sm text-text-main flex items-center min-h-[48px]">
                      {phone ? (
                        <div className="w-full font-semibold">{field.getValue(phone)}</div>
                      ) : (
                        <span className="text-text-muted/40 font-light">-</span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}

// ─── Slot Search Dropdown Component ──────────────────────────────────────────

interface SearchSelectorProps {
  index: number;
  onSelect: (phone: Phone) => void;
  allPhones: Phone[];
  selectedSlugs: string[];
}

function PhoneSearchSelector({ index, onSelect, allPhones, selectedSlugs }: SearchSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter out already selected phones and match query
  const filteredPhones = allPhones.filter((phone) => {
    const isAlreadySelected = selectedSlugs.includes(phone.slug);
    const matchesQuery =
      phone.name.toLowerCase().includes(query.toLowerCase()) ||
      phone.brand_slug.toLowerCase().includes(query.toLowerCase());
    return !isAlreadySelected && matchesQuery;
  });

  return (
    <div ref={dropdownRef} className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-border-subtle rounded-xl min-h-[220px] bg-surface-container-low/10 hover:bg-surface-container-low/20 transition-all duration-200 relative my-auto">
      <span className="material-symbols-outlined text-[32px] text-text-muted/60 mb-2">add_circle</span>
      <span className="text-xs font-semibold text-text-muted mb-4">Add Device {index + 1}</span>

      {/* Input container */}
      <div className="w-full relative max-w-[200px]">
        <input
          type="text"
          placeholder="Search phone..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full text-xs font-semibold py-2 px-3 pl-8 border border-border-subtle rounded-lg bg-surface-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm text-left text-text-main"
        />
        <span className="material-symbols-outlined text-[16px] text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
          search
        </span>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-[80%] left-4 right-4 bg-surface-white border border-border-subtle rounded-xl shadow-lg max-h-56 overflow-y-auto z-30 mt-2 divide-y divide-border-subtle/50 flex flex-col py-1">
          {filteredPhones.length > 0 ? (
            filteredPhones.map((phone) => (
              <button
                key={phone._id}
                onClick={() => {
                  onSelect(phone);
                  setQuery("");
                  setIsOpen(false);
                }}
                className="w-full py-2.5 px-4 text-left hover:bg-surface-container-low/60 flex items-center gap-3 transition-colors border-none outline-none cursor-pointer"
              >
                <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center p-1 border border-border-subtle/30 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={phone.images?.[0]?.url || "/placeholder-phone.webp"}
                    alt={phone.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-text-muted capitalize font-medium">
                    {phone.brand_slug.replace("-", " ")}
                  </span>
                  <span className="text-sm font-bold text-text-main truncate">
                    {phone.name}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div className="py-4 px-4 text-center text-xs text-text-muted font-medium">
              No devices found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
