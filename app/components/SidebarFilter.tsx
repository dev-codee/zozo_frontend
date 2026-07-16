"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Brand } from "@/app/lib/api";

export default function SidebarFilter({ brands }: { brands: Brand[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  useEffect(() => {
    const brandsParam = searchParams.get("brand");
    if (brandsParam) {
      setSelectedBrands(brandsParam.split(","));
    } else {
      setSelectedBrands([]);
    }

    setMinPrice(searchParams.get("min_price") || "");
    setMaxPrice(searchParams.get("max_price") || "");
  }, [searchParams]);

  const updateFilters = (newBrands: string[], min: string, max: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newBrands.length > 0) {
      params.set("brand", newBrands.join(","));
    } else {
      params.delete("brand");
    }

    if (min) params.set("min_price", min);
    else params.delete("min_price");

    if (max) params.set("max_price", max);
    else params.delete("max_price");

    // Also reset page if we had pagination
    params.delete("page");

    router.push(`/phones?${params.toString()}`);
  };

  const handleBrandChange = (brandSlug: string) => {
    const updated = selectedBrands.includes(brandSlug)
      ? selectedBrands.filter((b) => b !== brandSlug)
      : [...selectedBrands, brandSlug];
    
    setSelectedBrands(updated);
    updateFilters(updated, minPrice, maxPrice);
  };

  const handlePriceApply = () => {
    updateFilters(selectedBrands, minPrice, maxPrice);
  };

  return (
    <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
      {/* Price Range Filter */}
      <div>
        <h3 className="font-label-md text-label-md text-text-main mb-4 uppercase tracking-wider">
          Price Range (PKR)
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full bg-surface-white border border-border-subtle rounded-md px-3 py-2 font-body-sm text-body-sm focus:ring-1 focus:ring-primary-container focus:border-primary-container"
            />
            <span className="text-text-muted">-</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full bg-surface-white border border-border-subtle rounded-md px-3 py-2 font-body-sm text-body-sm focus:ring-1 focus:ring-primary-container focus:border-primary-container"
            />
          </div>
          <button
            onClick={handlePriceApply}
            className="w-full py-2 bg-surface-container-high hover:bg-surface-dim text-text-main font-label-md text-label-md rounded-md transition-colors"
          >
            Apply Price
          </button>
        </div>
      </div>

      <hr className="border-border-subtle" />

      {/* Brand Filter */}
      <div>
        <h3 className="font-label-md text-label-md text-text-main mb-4 uppercase tracking-wider">
          Brand
        </h3>
        <div className="space-y-3 custom-scrollbar max-h-64 overflow-y-auto pr-2">
          {brands.map((brand) => (
            <label
              key={brand.slug}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand.slug)}
                onChange={() => handleBrandChange(brand.slug)}
                className="w-4 h-4 rounded border-border-subtle text-primary-container focus:ring-primary-container"
              />
              <span className="font-body-sm text-body-sm text-text-main group-hover:text-primary-container transition-colors">
                {brand.name}
              </span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
